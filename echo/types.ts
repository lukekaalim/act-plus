import ts from 'typescript';
import { EchoDeclaration, EchoType } from './reflections';
import { ModuleBuildContext } from './module';
import { createId, getFlags, getIdentifier } from './utils';
import { buildExternalReferences, getModuleSource } from './external';
import { findExternalDeclarations, findExternalDeclarationsInSource } from './declaration';
import { createExternalTypeBuilder } from './types/external';
import { createDeclarationBuilder } from './types/declarations';
import { createTypeInstanceBuilder } from './types/instances';

export type TypeBuildContext = {
  module: ModuleBuildContext,

  parametricTypes: Map<ts.Symbol, EchoDeclaration.TypeParameter>,

  visitedTypes: Map<ts.Type, EchoType.ID>,
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
  const external = createExternalTypeBuilder(
    { module: context.module, parametricTypes: context.parametricTypes }
  );
  const declarations = createDeclarationBuilder(
    { module: context.module, parametricTypes: context.parametricTypes },
    external
  );
  const instances = createTypeInstanceBuilder(
    { module: context.module, visitedTypes: context.visitedTypes, parametricTypes: context.parametricTypes },
    external,
    declarations
  );

  /*

  const { module: { checker, host } } = context;

  const createType: typeof EchoType.create = (type, id, props) => {
    const echoType = EchoType.create(type, id, props);
    context.module.includedTypes.set(id, echoType);
    console.log(`Pushing type "${id}"`)
    return echoType;
  }

  const buildFromTsSignature = (signature: ts.Signature, id: EchoType.ID): EchoType.Callable => {

    const callable = createType('callable', id, {
      typeParameters: [],
      parameters: [],
      returns: createId()
    });

    callable.typeParameters = (signature.typeParameters || []).map(typeParameter => {
      const decl = (typeParameter.symbol.declarations || [])[0] as ts.TypeParameterDeclaration
      let extendsId: EchoType.ID | null = null;
      let defaultId: EchoType.ID | null = null;

      if (decl.constraint) {
        extendsId = declarations.fromAnyTypeNode(decl.constraint)
      }
      if (decl.default) {
        defaultId = declarations.fromAnyTypeNode(decl.default)
      }

      const typeParameterDeclaration: EchoDeclaration.TypeParameter = {
        id: createId<"EchoDeclarationID">(),
        identifier: decl.name.text,
        extends: extendsId,
        default: defaultId,
      }

      context.parametricTypes.set(typeParameter.symbol, typeParameterDeclaration);

      return typeParameterDeclaration;
    }).filter(x => !!x);

    callable.parameters = signature.parameters.map(param => {
      const type = checker.getTypeOfSymbol(param);
      const id = createId<"EchoTypeID">();
      return {
        name: param.name,
        optional: false,
        type: type ? (buildFromTsType(type, id), id) : createType('unsupported', id, { message: `Symbol has no type`}).id
      }
    })
    
    console.log(signature.getReturnType())
    buildFromTsType(signature.getReturnType(), callable.returns)
    
    return callable;
  }

  const buildFromTsType = (type: ts.Type, id: EchoType.ID) => {
    if (context.visitedTypes.has(type)) {
      // If we already know of this type, just
      // mark it as an "alias"
      const alias = context.visitedTypes.get(type) as EchoType.ID;
      createType('internal-alias', id, { alias });
      console.log('We have already visited this type', id);
      return;
    } else {
      // otherwise, mark this type as "visited",
      // to avoid infinite recursion
      context.visitedTypes.set(type, id);
    }
    
    switch (type.flags) {
      case ts.TypeFlags.Object: {
        const objectType = type as ts.ObjectType;
        if (objectType.objectFlags & ts.ObjectFlags.Reference) {
          const reference = objectType as ts.TypeReference;
          console.log('its a reference of some kind')
          let symbol = reference.target.getSymbol()
          if (!symbol) {
            console.log('But it had no symbol')
            return createType('unsupported', id, { message: `Reference missing symbol??` })
          }

          if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = checker.getAliasedSymbol(symbol);
          }

          console.log("lets see it type parameters")
          const typeParameters = (reference.typeArguments || []).map(type => {
            const id = createId<"EchoTypeID">();
            buildFromTsType(type, id);
            return id;
          });
          console.log("done with type params")

          const wellKnownReference = external.getReferenceTargetFromSymbol(symbol);
          if (wellKnownReference)
            return (console.log(`It was a well known reference!`), wellKnownReference);

          const declaration = external.buildExternalTypeFromSymbol(symbol);
          context.module.references.push(declaration);
          context.module.externalSymbols.set(symbol, declaration.id);

          console.log(`It was a external reference! (that we just pushed)`)
          return createType('reference', id, {
            target: { type: 'external', id: declaration.id },
            typeParameters,
          })
        }
        const signature = type.getCallSignatures()[0];
        if (signature) {
          console.log('It has a signature!')
          return buildFromTsSignature(signature, id)
        }
        if (objectType.getProperties().length > 0) {
          console.log(`It was an anonymous object. Lets see paul allen's properties:`)

          const propertySymbols = checker.getPropertiesOfType(objectType)
          const properties = Object.fromEntries(propertySymbols.map(symbol => {
            const id = createId<"EchoTypeID">();
            const propertyType = checker.getTypeOfSymbol(symbol);
            buildFromTsType(propertyType, id);
            return [symbol.name, id]
          }))

          return createType('object', id, { properties })
        }
        console.log(getFlags(ts.ObjectFlags as any, objectType.objectFlags))
        console.log('Unsupported thing')
        return createType('unsupported', id, { message: 'ObjectType ' + getFlags(ts.ObjectFlags as any, objectType.objectFlags) })
      }
      case ts.TypeFlags.Void:
      case ts.TypeFlags.VoidLike:
          console.log(`It was a keyword`)
        return createType('keyword', id, { keyword: 'void' })
      case ts.TypeFlags.Boolean:
      case ts.TypeFlags.NumberLiteral:
      case ts.TypeFlags.StringLiteral: {
          console.log(`It was a literal`)
        const stringLiteral = type as ts.StringLiteralType;
        return createType('literal', id, { value: stringLiteral.value })
      }
    }
    console.log(`It was a something unsupported`)
    return createType('unsupported', id, { message: 'RealType ' + getFlags(ts.TypeFlags as any, type.flags) })
  }

  const buildTypeParameterDeclarations = (parameters?: ts.NodeArray<ts.TypeParameterDeclaration>): EchoDeclaration.TypeParameter[] => {
    if (!parameters)
      return [];

    return parameters.map(parameter => {
      const extendsId = createId<"EchoTypeID">();
      const defaultId = createId<"EchoTypeID">();
      const _extends = parameter.constraint && buildFromTsTypeNode(parameter.constraint, extendsId) || null
      const _default = parameter.default && buildFromTsTypeNode(parameter.default, defaultId) || null
      return { extends: _extends && extendsId, default: _default && defaultId } as EchoDeclaration.TypeParameter
    })
  }

  const buildFunction = (functionType: ts.FunctionTypeNode): EchoType.Callable => {
    throw new Error("Not yet Supported");

    const typeParameters = buildTypeParameterDeclarations(functionType.typeParameters);

    return createType('callable', {
      parameters: functionType.parameters.map(parameter => {
        return {
          name: getIdentifier(parameter.name),
          type: parameter.type ? buildFromTsTypeNode(parameter.type).id : createType('unsupported', { message: '???' }).id,
          optional: !!parameter.questionToken
        }
      }),
      returns: buildFromTsTypeNode(functionType.type).id,
      typeParameters
    })
  }
*/

  return {
    instances,
    declarations,
  }
}
