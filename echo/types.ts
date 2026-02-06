import ts from 'typescript';
import { EchoDeclaration, EchoType } from './reflections';
import { ModuleBuildContext } from './module';
import { createId, getFlags, getIdentifier } from './utils';
import { buildExternalReferences, getModuleSource } from './external';
import { findExternalDeclarations, findExternalDeclarationsInSource } from './declaration';

export type TypeBuildContext = {
  module: ModuleBuildContext,

  parametricTypes: ts.Symbol[],
}

export type PackageFileReferenceInfo = {
  /**
   * The name of the package (the `.name` field in the package.json)
   */
  package: string,
  /**
   * The absolute path to the directory that has the package.json
   */
  packagePath: string,
  /**
   * The relative path of the file to the package
   */
  relativePath: string,
}

export const createTypeBuilder2 = (context: TypeBuildContext) => {

  const { module: { checker, host } } = context;

  // Search through the parent folders of "filename"
  // to find a package.json
  const findClosestPackage = (filename: string): PackageFileReferenceInfo | null => {
    const pathSegments = filename.startsWith('/')
      ? filename.split('/')
      : (host.getCurrentDirectory() + '/' + filename).split('/');

    for (let i = 0; i < pathSegments.length; i++) {
      const directory = pathSegments.slice(0, pathSegments.length - i - 1).join('/');
      const packageJSONFile = host.readFile(directory + '/package.json')
      if (packageJSONFile) {
        const packageJSON = JSON.parse(packageJSONFile);
        if (packageJSON['name']) {
          const relativePath = pathSegments.slice(pathSegments.length - i - 1).join('/');
          const packagePath = pathSegments.slice(0, pathSegments.length - i - 1).join('/')
          return {
            package: packageJSON['name'],
            packagePath,
            relativePath,
          }
        }
      }
    }

    return null;
  }

  const findFilenameForTsNode = (node: ts.Node) => {
    let currentNode: ts.Node | null = node;

    while (currentNode && currentNode.kind !== ts.SyntaxKind.SourceFile) {
      currentNode = currentNode.parent;
    }

    if (!currentNode)
      throw new Error(`No sourcefile found`);

    return currentNode as ts.SourceFile;
  }

  const buildFromTsSymbol = (symbol: ts.Symbol, typeParameters: readonly ts.Type[]): EchoType => {
    const internalSymbolID = context.module.internalSymbols.get(symbol);
    if (internalSymbolID !== undefined) {
      return EchoType.create('reference', {
        target: { type: 'internal', id: internalSymbolID },
        typeParameters: typeParameters.map(typeParam => buildFromTsType(typeParam))
      })
    }

    const declaration = (symbol.getDeclarations() || [])[0];
    if (!declaration) {
      return EchoType.create('unsupported', {
        message: `Symbol has no declaration??? Where did it come from? (${symbol.name})`
      })
    }
    const declarationSourceFile = findFilenameForTsNode(declaration);
    const declarationPackage = findClosestPackage(declarationSourceFile.fileName);
    
    if (declarationPackage) {
      const resolution = ts.resolveModuleName(
          declarationPackage.package,
          context.module.program.getCurrentDirectory(),
          context.module.program.getCompilerOptions(),
          context.module.host,
        )
      if (resolution.resolvedModule) {
        const sourceFile = context.module.program.getSourceFile(resolution.resolvedModule.resolvedFileName);
        if (sourceFile)
          findExternalDeclarationsInSource(declarationPackage.packagePath, sourceFile, context.module);
      }
    }
    let externalSymbolID = context.module.externalSymbols.get(symbol);
    if (externalSymbolID !== undefined) {
      return EchoType.create('reference', {
        target: { type: 'external', id: externalSymbolID },
        typeParameters: typeParameters.map(typeParam => buildFromTsType(typeParam))
      })
    }

    // fallback, just create a reference directly to the module
    externalSymbolID = createId<"EchoDeclarationID">()

    context.module.externalSymbols.set(symbol, externalSymbolID);
    context.module.references.push(EchoDeclaration.create(externalSymbolID, 'external', {
      identifier: symbol.name,
      filename: declarationPackage
        ? declarationPackage.package + '/' + declarationPackage.relativePath
        : declarationSourceFile.fileName,
    }))

    return EchoType.create('reference', {
      target: { type: 'external', id: externalSymbolID },
      typeParameters: typeParameters.map(typeParam => buildFromTsType(typeParam))
    })

    return EchoType.create('unsupported', {
      message: `Need to create new declaration`
    })
  }

  const buildFromTsTypeReference = (reference: ts.TypeReference): EchoType => {
    // get params

    // explore target declaration module
    const symbol = reference.target.symbol
    if (symbol.flags & ts.SymbolFlags.Alias)
      symbol = checker.getAliasedSymbol(symbol)
  }

  const buildFromTsTypeReferenceNode = (reference: ts.TypeReferenceNode): EchoType => {
    let symbol = checker.getSymbolAtLocation(reference.typeName);
    if (!symbol) {
      throw new Error(`Unknown type reference`);
    }
    // See if we've encountered this symbol before

    const internalSymbolID = context.module.internalSymbols.get(symbol);
    if (internalSymbolID !== undefined) {
      return EchoType.create('reference', {
        target: { type: 'internal', id: internalSymbolID },
        typeParameters: (reference.typeArguments || []).map(buildFromTsTypeNode)
      })
    }
    let externalSymbolID = context.module.externalSymbols.get(symbol);
    if (externalSymbolID !== undefined) {
      return EchoType.create('reference', {
        target: { type: 'external', id: externalSymbolID },
        typeParameters: (reference.typeArguments || []).map(buildFromTsTypeNode)
      })
    }

    if (symbol.flags & ts.SymbolFlags.Alias)
      symbol = checker.getAliasedSymbol(symbol)

    const declaration = (symbol.getDeclarations() || [])[0];
    if (!declaration) {
      return EchoType.create('unsupported', {
        message: `Symbol has no declaration??? Where did it come from? (${symbol.name})`
      })
    }

    const declarationSourceFile = findFilenameForTsNode(declaration);
    const mySourceFile = findFilenameForTsNode(reference)
    const declarationPackage = findClosestPackage(declarationSourceFile.fileName);
    
    if (declarationPackage) {
      findExternalDeclarations(declarationPackage, mySourceFile, context.module);
    }

    const visitedDeclaration = context.module.exploredSymbols.get(symbol);
    if (visitedDeclaration) {
      // we found an explored symbol that wasn't previously included
      // in external symbols
      context.module.externalSymbols.set(symbol, visitedDeclaration.id);
      context.module.references.push(visitedDeclaration);
      context.module.identifiers.set(visitedDeclaration.id, visitedDeclaration.identifier);

      return EchoType.create('reference', {
        target: { type: 'external', id: visitedDeclaration.id },
        typeParameters: (reference.typeArguments || []).map(buildFromTsTypeNode)
      })
    }


    // fallback, just create a reference directly to the module
    externalSymbolID = createId<"EchoDeclarationID">()

    context.module.externalSymbols.set(symbol, externalSymbolID);
    context.module.references.push(EchoDeclaration.create(externalSymbolID, 'external', {
      identifier: symbol.name,
      filename: declarationPackage
        ? declarationPackage.package + '/' + declarationPackage.relativePath
        : declarationSourceFile.fileName,
    }))

    return EchoType.create('reference', {
      target: { type: 'external', id: externalSymbolID },
      typeParameters: (reference.typeArguments || []).map(buildFromTsTypeNode)
    })
  }

  const buildLiteral = (literalType: ts.LiteralTypeNode) => {
    switch (literalType.literal.kind) {
      case ts.SyntaxKind.StringLiteral:
        return EchoType.create('literal', { value: literalType.literal.text })
      case ts.SyntaxKind.NullKeyword:
        return EchoType.create('literal', { value: null });
      default:
        return EchoType.create('unsupported', { message: `literal (${ts.SyntaxKind[literalType.literal.kind]})` })
    }
  }

  /**
   * This means an object "{ prop: value }" rather than a literal (value): "a literal string"
   * @param typeLiteralType
   */
  const buildTypeLiteral = (typeLiteralType: ts.TypeLiteralNode) => {
    
    return EchoType.create('object', {
      properties: Object.fromEntries(typeLiteralType.members.map(member => {
        if (!member.name)
          return ['unknown', EchoType.create('unsupported', { message: `Unknown name` })]

        switch (member.kind) {
          case ts.SyntaxKind.PropertySignature:
            const propertySignature = member as ts.PropertySignature;
            if (!propertySignature.type)
              return [getIdentifier(member.name), EchoType.create('unsupported', { message: `Unknown name` })]
            return [getIdentifier(member.name), buildFromTsTypeNode(propertySignature.type)]
          case ts.SyntaxKind.MethodSignature:
            return ['unknown', EchoType.create('unsupported', { message: `Unknown name` })]
          default:
          return ['unknown', EchoType.create('unsupported', { message: `Unknown name` })]
        }
      }))
    })
  }

  const buildArrayType = (arrayType: ts.ArrayTypeNode) => {
    return EchoType.create('array', { element: buildFromTsTypeNode(arrayType.elementType) });
  }

  const buildIndexedAccessType = (indexedAccessType: ts.IndexedAccessTypeNode) => {
    return EchoType.create('indexed-access', {
      target: buildFromTsTypeNode(indexedAccessType.objectType),
      accessor: buildFromTsTypeNode(indexedAccessType.indexType)
    })
  }

  const buildFromTsTypeNode = (type: ts.TypeNode): EchoType => {
    if(!type)
      return EchoType.create('unsupported', { message: 'No type provided' });

    switch (type.kind) {
      case ts.SyntaxKind.TypeReference:
        return buildFromTsTypeReferenceNode(type as ts.TypeReferenceNode)

      case ts.SyntaxKind.LiteralType:
        return buildLiteral(type as ts.LiteralTypeNode)
      case ts.SyntaxKind.StringKeyword:
        return EchoType.create('builtin', { builtin: 'string' });
      case ts.SyntaxKind.NumberKeyword:
        return EchoType.create('builtin', { builtin: 'number' });
      case ts.SyntaxKind.BooleanKeyword:
        return EchoType.create('builtin', { builtin: 'boolean' });
      case ts.SyntaxKind.VoidKeyword:
        return EchoType.create('keyword', { keyword: 'void' });
      case ts.SyntaxKind.AnyKeyword:
        return EchoType.create('keyword', { keyword: 'any' });
      case ts.SyntaxKind.NeverKeyword:
        return EchoType.create('keyword', { keyword: 'never' });
      case ts.SyntaxKind.UndefinedKeyword:
        return EchoType.create('keyword', { keyword: 'undefined' });
      case ts.SyntaxKind.TypeLiteral:
        return buildTypeLiteral(type as ts.TypeLiteralNode);
      case ts.SyntaxKind.ArrayType:
        return buildArrayType(type as ts.ArrayTypeNode);
      case ts.SyntaxKind.UnionType:
        return EchoType.create('union', { branches: (type as ts.UnionTypeNode).types.map(buildFromTsTypeNode) })

      case ts.SyntaxKind.IntersectionType:
        return EchoType.create('intersection', { branches: (type as ts.IntersectionTypeNode).types.map(buildFromTsTypeNode) })
      case ts.SyntaxKind.FunctionType:
        return buildFunction(type as ts.FunctionTypeNode);
      case ts.SyntaxKind.IndexedAccessType:
        return buildIndexedAccessType(type as ts.IndexedAccessTypeNode)
      default:
        return EchoType.create('unsupported', { message: `Don't support "${ts.SyntaxKind[type.kind]}" yet`})
    }
  }

  const buildFromTsSignature = (signature: ts.Signature): EchoType.Callable => {
    return EchoType.create('callable', {
      parameters: [],
      typeParameters: {},
      returns: buildFromTsType(checker.getReturnTypeOfSignature(signature))
    });
  }

  const fromAnonymousObject = (objectType: ts.ObjectType): EchoType => {
    objectType.getApparentProperties
    throw new Error()
  }

  const buildFromTsType = (type: ts.Type, ignoreSymbol: boolean = false): EchoType.Any => {
    if (!ignoreSymbol) {
      let symbol = type.aliasSymbol;
      
      if (symbol) {
        if (symbol.flags & ts.SymbolFlags.Alias)
          symbol = checker.getAliasedSymbol(symbol)

        return buildFromTsSymbol(symbol, (type.aliasTypeArguments || []))
      }
    }

    const signature = type.getCallSignatures()[0];
    if (signature) {
      return buildFromTsSignature(signature)
    }

    switch (type.flags) {
        case ts.TypeFlags.Object: {
        const objectType = type as ts.ObjectType;
        if (objectType.objectFlags & ts.ObjectFlags.Reference) {
          const reference = objectType as ts.TypeReference;
          const symbol = reference.target.getSymbol()
          if (!symbol)
            return EchoType.create('unsupported', { message: `Reference missing symbol??` })

          return buildFromTsSymbol(symbol, (reference.typeArguments || []));
        }
        if (objectType.objectFlags & (ts.ObjectFlags.ObjectLiteral | ts.ObjectFlags.Interface | ts.ObjectFlags.Anonymous)) {
          const propertySymbols = checker.getPropertiesOfType(objectType)
          const properties = Object.fromEntries(propertySymbols.map(symbol => {
            const propertyType = checker.getTypeOfSymbol(symbol);
            return [symbol.name, buildFromTsType(propertyType)]
          }))

          return EchoType.create('object', { properties })
        }
        console.log(getFlags(ts.ObjectFlags as any, objectType.objectFlags), objectType)
        return EchoType.create('unsupported', { message: 'ObjectType ' + getFlags(ts.ObjectFlags as any, objectType.objectFlags) })
      }
    }
    return EchoType.create('unsupported', { message: 'RealType ' + getFlags(ts.TypeFlags as any, type.flags) })
  }

  const buildArrowFunction = (arrowFunction: ts.ArrowFunction): EchoType.Callable => {
    const realType = checker.getTypeAtLocation(arrowFunction) as ts.ObjectType;
    const sig = checker.getSignaturesOfType(realType, ts.SignatureKind.Call)[0];
    const returnType = sig.getReturnType();

    return EchoType.create('callable', {
      typeParameters: buildTypeParameterDeclarations(arrowFunction.typeParameters),
      parameters: arrowFunction.parameters.map(parameter => {
        return {
          name: getIdentifier(parameter.name),
          type: buildType(parameter.type),
          optional: !!parameter.questionToken
        }
      }),
      returns: arrowFunction.type ? buildType(arrowFunction.type) : fromType(returnType),
    })
  }

  const buildTypeParameterDeclarations = (parameters?: ts.NodeArray<ts.TypeParameterDeclaration>): Record<string, EchoDeclaration.TypeParameter> => {
    if (!parameters)
      return {};

    return Object.fromEntries(parameters.map(parameter => {
      const _extends = parameter.constraint && buildFromTsTypeNode(parameter.constraint) || null
      const _default = parameter.default && buildFromTsTypeNode(parameter.default) || null
      return [parameter.name.text, { extends: _extends, default: _default } as EchoDeclaration.TypeParameter]
    }))
  }

  const buildFunction = (functionType: ts.FunctionTypeNode): EchoType.Callable => {
    const typeParameters = buildTypeParameterDeclarations(functionType.typeParameters);

    return EchoType.create('callable', {
      parameters: functionType.parameters.map(parameter => {
        return {
          name: getIdentifier(parameter.name),
          type: parameter.type ? buildFromTsTypeNode(parameter.type) : EchoType.create('unsupported', { message: '???' }),
          optional: !!parameter.questionToken
        }
      }),
      returns: buildFromTsTypeNode(functionType.type),
      typeParameters
    })
  }


  return {
    buildFromTsTypeNode,
    buildFromTsType
  }
}
