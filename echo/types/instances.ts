import ts from "typescript";
import { EchoDeclaration, EchoType } from "../reflections";
import { createId, getFlags } from "../utils";
import { ExternalTypeBuilder } from "./external";
import { DeclarationsTypeBuilder } from "./declarations";
import { TypeBuildContext } from "../types";

export type TypeInstanceBuilder = {
  fromType(type: ts.Type): EchoType.ID
}

/**
 * This type builder mostly resolves "real" type objects
 * acquired from the typescript type checker.
 */
export const createTypeInstanceBuilder = (
  context: TypeBuildContext,
  external: ExternalTypeBuilder,
  declarations: DeclarationsTypeBuilder
): TypeInstanceBuilder => {
  const { checker } = context.ts;
  
  const pushType = <T extends EchoType["type"]>(
    instance: ts.Type,
    type: T,
    // We use a "createProps" function here
    // for ergonomics, as 
    createProps: Omit<EchoType.ByType<T>, "id" | "type"> | (() => Omit<EchoType.ByType<T>, "id" | "type">)
  ) => {
    const id = createId<"EchoTypeID">();
    context.typeByTypescript.set(instance, id);

    const props = typeof createProps === 'function' ? createProps() : createProps;

    const echoType = EchoType.create(type, id, props);
    context.types.set(id, echoType);

    return id;
  }

  const fromType = (type: ts.Type): EchoType.ID => {
    // If we already know of this type, just
    // return it instead.
    if (context.typeByTypescript.has(type)) {
      return context.typeByTypescript.get(type) as EchoType.ID;
    }
    if (type.aliasSymbol) {
      const target = external.getSymbolTarget(type.aliasSymbol);
      return pushType(type, 'reference', () => ({
        target,
        typeParameters: (type.aliasTypeArguments || []).map(type => fromType(type))
      }))
    }
    if (type.symbol) {
      const declaredType = context.declarationBySymbol.get(type.symbol)
      if (declaredType) {
        return pushType(type, 'reference', {
          target: { type: 'declaration', id: declaredType },
          typeParameters: []
        })
      }
    }

    if (type.flags & ts.TypeFlags.Boolean) {
      return pushType(type, 'builtin', { builtin: 'boolean' });
    }
    
    switch (type.flags) {
      case ts.TypeFlags.Union: {
        const unionType = type as ts.UnionType;
        return pushType(type, 'union', () => ({ branches: unionType.types.map(fromType) }));
      }
      case ts.TypeFlags.Object: {
        const objectType = type as ts.ObjectType;

        if (objectType.objectFlags & ts.ObjectFlags.Reference) {
          const reference = objectType as ts.TypeReference;

          if (reference.target.objectFlags & ts.ObjectFlags.Tuple) {
            // special case: this is a tuple
            return pushType(type, 'tuple', () => ({
              values: (reference.typeArguments || []).map(value => fromType(value))
            }))
          }

          let symbol = reference.target.getSymbol()
          if (!symbol) {
            return pushType(type, 'unsupported', () => ({ message: `Reference missing symbol??` }))
          }

          if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = checker.getAliasedSymbol(symbol);
          }
          const target = external.getSymbolTarget(symbol);

          return pushType(type, 'reference', () => ({
            target,
            typeParameters: (reference.typeArguments || []).map(type => fromType(type))
          }))
        }

        if (type.symbol && !(objectType.objectFlags & ts.ObjectFlags.Anonymous)) {
          const target = external.getSymbolTarget(type.symbol);
          return pushType(type, 'reference', () => ({
            target,
            typeParameters: []
          }))
        }

        const signature = type.getCallSignatures()[0];
        if (signature) {
          return fromSignature(type, signature)
        }

        if (objectType.getProperties().length > 0) {
          const propertySymbols = checker.getPropertiesOfType(objectType)

          return pushType(type, 'object', () => ({
            properties: Object.fromEntries(propertySymbols.map(symbol => {
              const propertyType = checker.getTypeOfSymbol(symbol);
              return [symbol.name, fromType(propertyType)]
            }))
          }))
        }
        return pushType(type, 'unsupported', () => ({ message: 'ObjectType ' + getFlags(ts.ObjectFlags as any, objectType.objectFlags) }))
      }
      case ts.TypeFlags.Undefined:
        return pushType(type, 'keyword', { keyword: 'undefined' });
      case ts.TypeFlags.Void:
      case ts.TypeFlags.VoidLike:
        return pushType(type, 'keyword', () => ({ keyword: 'void' as const }));
      case ts.TypeFlags.BooleanLiteral:
        return pushType(type, 'builtin', { builtin: 'boolean' });
      case ts.TypeFlags.Boolean:
      case ts.TypeFlags.NumberLiteral:
      case ts.TypeFlags.StringLiteral: {
        const stringLiteral = type as ts.StringLiteralType;
        return pushType(type, 'literal', () => ({ value: stringLiteral.value }));
      }
      case ts.TypeFlags.String:
        return pushType(type, 'builtin', () => ({ builtin: 'string' } as const));
      case ts.TypeFlags.Any:
        return pushType(type, 'keyword', () => ({ keyword: 'any' } as const));
      case ts.TypeFlags.TypeParameter:
      case ts.TypeFlags.Union:
    }
    return pushType(type, 'unsupported', () => ({ message: 'RealType ' + getFlags(ts.TypeFlags as any, type.flags) }))
  }

  const fromSignature = (type: ts.Type, signature: ts.Signature) => {
    return pushType(type, 'callable', () => {
      const typeParameters = (signature.typeParameters || []).map(typeParameter => {
        const decl = (typeParameter.symbol.declarations || [])[0] as ts.TypeParameterDeclaration

        return declarations.fromTypeParameterDeclaration(decl);
      }).filter(x => !!x);

      const parameters = signature.parameters.map(param => {
        const type = checker.getTypeOfSymbol(param);
        
        return {
          name: param.name,
          optional: false,
          type: type ? fromType(type) : pushType(type, 'unsupported', () => ({ message: `Symbol has no type`}))
        }
      })

      const returnType = checker.getReturnTypeOfSignature(signature);
      const returns = fromType(returnType)

      return {
        typeParameters,
        parameters,
        returns,
      }
    })
  };

  return {
    fromType,
  }
}