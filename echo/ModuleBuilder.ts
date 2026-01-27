import ts from "typescript";
import { EchoDeclaration, EchoModule, EchoType } from "./reflections.ts";
import { DocComment, TextRange, TSDocParser } from "@microsoft/tsdoc";
import { createTypeBuilder } from "./typeBuilder.ts";

export const createEchoModuleBuilder = (checker: ts.TypeChecker) => {
  const visitedTypes = new Map<ts.Type, EchoType.Any>();
  const parser = new TSDocParser();

  const exportMap = new Map();
  const missedAliases = new Map();

  /*

  const createTypeFromSignature = (signature: ts.Signature): EchoType.Any => {
    const parameters = signature.getParameters()
    const typeParameters = signature.getTypeParameters()
    const returnType = signature.getReturnType()

    return {
      id: createId(),
      type: 'callable',
      parameters: Object.fromEntries(parameters.map(parameter => {
        switch (parameter.flags) {
          case ts.SymbolFlags.FunctionScopedVariable:
            return [parameter.name, createTypeOrReference(checker.getTypeOfSymbol(parameter))]
        }
        return [parameter.name, { id: createId(), type: `unsupported`, message: ts.SymbolFlags[parameter.flags] }]
      })),
      returns: createTypeOrReference(returnType)
    }
  }

  const createTypeFromObject = (object: ts.ObjectType): EchoType.Any => {
    if (object.getCallSignatures().length) {
      const signature = object.getCallSignatures()[0];
      return createTypeFromSignature(signature);
    }
    if (object.objectFlags & ts.ObjectFlags.Reference) {
      //console.log('Reference', object.symbol.name)
      const reference = object as ts.TypeReference;
      const referenceSymbol = reference.target.symbol
      return { id: createId(), type: 'alias', name: referenceSymbol.name }
    }
    //console.log('Object', getFlags(ts.ObjectFlags as any, object.objectFlags))
    if (checker.isArrayType(object)) {
      const typeParameters = checker.getTypeArguments(object as ts.TypeReference);
      return { id: createId(), type: 'array', element: createTypeOrReference(typeParameters[0]) }
    }

    const properties = Object.fromEntries(
      object.getProperties().map((prop): [string, EchoType.Any] => {
        if ((prop.flags & ts.SymbolFlags.Property) === ts.SymbolFlags.Property) {
          return [prop.name, createTypeFromType(checker.getTypeOfSymbol(prop))]
        }
        if ((prop.flags & ts.SymbolFlags.Method) === ts.SymbolFlags.Method) {
          return [prop.name, createTypeFromType(checker.getTypeOfSymbol(prop))]
        }
        return [prop.name, { id: createId(), type: `unsupported`, message: getFlags(ts.SymbolFlags as any, prop.flags).join(',') }]
    })
    )
    return { id: createId(), type: 'object', properties };
  }

  const createTypeOrReference = (type: ts.Type): EchoType.Any => {
    const symbol = type.getSymbol();
    if (!symbol)
      return createTypeFromType(type);

    if (exportMap.has(symbol)) {
      return { id: createId(), type: 'alias', name: symbol.name }
    } else {
      //console.log(`Dunno who ${symbol.name} is`)
    }
    
    if (missedAliases.has(symbol)) {
      return { id: createId(), type: 'unsupported', message: `${symbol.name} has already been missed` }
    }
    missedAliases.set(symbol, type);

    return createTypeFromType(type);
    //return { id: createId(), type: 'unsupported', message: `I might be a reference: ${SymbolFlags[symbol.flags]}` };
  }

  const createTypeFromType = (type: ts.Type): EchoType.Any => {
    switch (type.flags) {
      case ts.TypeFlags.Object:
        const object = type as ts.ObjectType;
        return createTypeFromObject(object);
      default:
        return { id: createId(), type: 'unsupported', message: `Don't support (${type.flags}) ${ts.TypeFlags[type.flags]} yet.` };
      case ts.TypeFlags.Any:
        return { id: createId(), type: 'keyword', keyword: 'any' };
      case ts.TypeFlags.String:
        return { id: createId(), type: 'builtin', builtin: 'string' }
      case ts.TypeFlags.Number:
        return { id: createId(), type: 'builtin', builtin: 'number' }
      case ts.TypeFlags.Boolean:
        return { id: createId(), type: 'builtin', builtin: 'boolean' }
      case ts.TypeFlags.Void:
        return { id: createId(), type: 'keyword', keyword: 'void' }
      case ts.TypeFlags.Intersection:
        const intersection = type as ts.IntersectionType;
        return { id: createId(), type: 'intersection', branches: intersection.types.map(createTypeOrReference) }
      case ts.TypeFlags.StringLiteral:
        const stringLiteral = type as ts.StringLiteralType;
        return { id: createId(), type: 'literal', value: stringLiteral.value }
      case ts.TypeFlags.NumberLiteral:
        const numberLiteral = type as ts.NumberLiteralType;
        return { id: createId(), type: 'literal', value: numberLiteral.value }

      case ts.TypeFlags.Union:
        const union = type as ts.UnionType;
        return { id: createId(), type: 'union', branches: union.types.map(createTypeOrReference) }
    }
  }

  const createTypeForAliasSymbol = (symbol: ts.Symbol): EchoType.Any => {
    const type = checker.getDeclaredTypeOfSymbol(symbol);
    if (type.aliasTypeArguments) {
      const declaration = (symbol.getDeclarations() || [])[0] as ts.TypeAliasDeclaration;
      console.log(declaration.type)
    }

    console.log(symbol.name, ts.SymbolFlags[type.getSymbol()?.flags || 0], ts.TypeFlags[type.flags])

    return createTypeOrReference(type);
  }

  const createTypeForSymbol = (symbol: ts.Symbol): EchoType.Any => {
    switch (symbol.flags) {
      default:
        return { type: 'unsupported', id: createId(), message: `Don't support ${symbol.flags} ${ts.SymbolFlags[symbol.flags]} yet` };
      case ts.SymbolFlags.TypeAlias:
        const type = checker.getTypeOfSymbol(symbol);
        return createTypeOrReference(type);
    }
  }

  const createTopLevelSubject = (namespaces: string[], symbol: ts.Symbol): EchoSubject[] => {
    const doc = symbol.getDocumentationComment(checker);

    if ((symbol.flags & ts.SymbolFlags.NamespaceModule) === ts.SymbolFlags.NamespaceModule) {
      return createModuleFromModuleSymbol([...namespaces, symbol.name], symbol).exports;
    }

    switch (symbol.flags) {
      default:
        console.log(`Unsupported ${symbol.name} is ${getFlags(ts.SymbolFlags as any, symbol.flags)}`)
        return [];
      case ts.SymbolFlags.TypeAlias:
        const typeParameterDeclarations = checker.symbolToTypeParameterDeclarations(symbol, undefined, undefined) || [];
        return [{
          name: [...namespaces, symbol.name].join('.'),
          parent: null,
          children: [],
          typeParameters: typeParameterDeclarations.map(declaration => {
            return declaration.name.text
          }),
          
          //comment: parser.parseString("").docComment,
          type: createTypeForAliasSymbol(symbol),
        }]
    }
  }

  const createModuleFromModuleSymbol = (namespaces: string[], moduleSymbol: ts.Symbol): EchoModule => {
    const exportedSymbols = checker.getExportsOfModule(moduleSymbol);

    return {
      //source,
      types: {},
      exports: exportedSymbols.map(symbol => createTopLevelSubject(namespaces, symbol)).flat(1),
    }
  }

  */

  const createDeclarationsFromSymbol = (namespace: string[], symbol: ts.Symbol): EchoDeclaration[] => {
    if ((symbol.flags & ts.SymbolFlags.NamespaceModule) || (symbol.flags & ts.SymbolFlags.ValueModule)) {
      const exportedSymbols = checker.getExportsOfModule(symbol);
      return exportedSymbols
        .map(exportedSymbol => createDeclarationsFromSymbol([...namespace, symbol.name], exportedSymbol))
        .flat(1);
    }

    const identifier = [...namespace, symbol.name].join('.');

    if (!symbol.declarations)
      return [];

    return symbol.declarations.map(declaration => {
      const builder = createTypeBuilder(checker);
      const source = declaration.getSourceFile();
      const ranges = ts.getLeadingCommentRanges(source.text, declaration.pos);
      let doc: string | null = null;
      if (ranges) {
        doc = source.text.slice(ranges[0].pos, ranges[0].end)
      }

      switch (declaration.kind) {
        case ts.SyntaxKind.TypeAliasDeclaration:
          const typeAliasDeclaration = declaration as ts.TypeAliasDeclaration;
          const parameters = Object.fromEntries((typeAliasDeclaration.typeParameters || []).map(parameter => {
            const _extends = parameter.constraint && builder.buildType(parameter.constraint) || null
            const _default = parameter.default && builder.buildType(parameter.default) || null
            return [parameter.name.text, { extends: _extends, default: _default } as EchoDeclaration.TypeParameter]
          }))
          const declares = builder.buildType(typeAliasDeclaration.type);

          
          return [EchoDeclaration.create("type", { identifier, declares, parameters, doc })];
        case ts.SyntaxKind.VariableDeclaration:
          const variableDeclaration = declaration as ts.VariableDeclaration;
          let variableType;
          if (!variableDeclaration.type && variableDeclaration.initializer) {
            const type = checker.getTypeAtLocation(variableDeclaration.initializer);
            const typeNode = checker.typeToTypeNode(type, undefined, undefined)
            
            if (typeNode) {
              if (typeNode.kind === ts.SyntaxKind.FunctionType) {
                const functionTypeNode = typeNode as ts.FunctionTypeNode;
                const signature = builder.buildFunction(functionTypeNode);
                return [EchoDeclaration.create('function', { identifier, signature, doc })]
              }
            }
            variableType = typeNode && builder.buildType(typeNode) || null;
          } else {
            variableType = builder.buildType(variableDeclaration.type);
          }
          return [EchoDeclaration.create('variable', { identifier, typeof: variableType, doc })]
        default:
          return [EchoDeclaration.create("unsupported", { identifier, message: `Unsupported declaration type: ${ts.SyntaxKind[declaration.kind]}`, doc })];
      }
    }).flat(1);
  }

  const createModule = (source: ts.SourceFile): EchoModule => {
    const sourceSymbol = checker.getSymbolAtLocation(source);
    if (!sourceSymbol)
      throw new Error();

    const exportedSymbols = checker.getExportsOfModule(sourceSymbol);
    return {
      exports: exportedSymbols.map(symbol => createDeclarationsFromSymbol([], symbol)).flat(1)
    }
  }

  return {
    createModule,
  }
}
