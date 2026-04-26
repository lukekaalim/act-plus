import ts from "typescript";
import { ModuleBuildContext } from "../echo";
import { TypeBuilder } from "./builder";
import { Type, TypeID } from "../../definitions/type";
import { createId, getFlags } from "../../utils";
import { ExtractTypePropsByName } from "../../definitions/meta";

export type InstanceTypeBuilder = {
  fromTypeInstance(type: ts.Type, noReferenceResolution?: boolean): TypeID
}

/**
 * This type builder mostly resolves "real" type objects
 * acquired from the typescript type checker.
 */
export const createTypeInstanceBuilder = (context: ModuleBuildContext, builder: TypeBuilder) => {
  const { checker } = context.ts;
  const typeIdByInstance = new Map<ts.Type, TypeID>();
  

  const pushType = <T extends Type["type"]>(
    instance: ts.Type,
    type: T,
    // We use a "createProps" function here
    // for ergonomics, as 
    createProps:
      | ExtractTypePropsByName<T>
      | (() => ExtractTypePropsByName<T>)
  ) => {
    const id = createId<"TypeID">();
    typeIdByInstance.set(instance, id);

    const props = typeof createProps === 'function' ? createProps() : createProps;

    const createdType = {
      id,
      type,
      ...props
    } as Extract<Type, { type: T }>
    context.types.set(id, createdType);

    return id;
  }


  const fromTypeInstance = (type: ts.Type, noReferenceResolution: boolean = false): TypeID => {

    if (!noReferenceResolution) {
      if (type.aliasSymbol) {
        const target = builder.getIdentifierFromSymbol(type.aliasSymbol);
        if (target)
          return pushType(type, 'reference', () => ({
            target,
            meta: { resolvedBy: 'instance:aliasSymbol' },
            parameters: (type.aliasTypeArguments || []).map(type => builder.fromTypeInstance(type))
          }))
      }
      if (type.flags === ts.TypeFlags.Object && ((type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference)) {
        const reference = type as ts.TypeReference;

        let symbol = reference.target.getSymbol()
        if (!symbol) {
          return pushType(type, 'parser-error', () => ({ message: `Reference missing symbol??` }))
        }

        if (symbol.flags & ts.SymbolFlags.Alias) {
          symbol = checker.getAliasedSymbol(symbol);
        }
        const target = builder.getIdentifierFromSymbol(symbol);
        if (target)
          return pushType(type, 'reference', () => ({
            target,
            meta: { resolvedBy: 'instance:referenceTargetSymbol' },
            parameters: (reference.typeArguments || []).map(type => builder.fromTypeInstance(type))
          }))
      }
      if (type.symbol && (type.symbol.flags & ts.SymbolFlags.Transient) === 0) {
        const identifier = builder.getIdentifierFromSymbol(type.symbol)
        if (identifier)
          return pushType(type, 'reference', {
            target: identifier,
            meta: { resolvedBy: 'instance:symbol' },
            parameters: []
          })
      }
    }

    // If we already know of this type, just
    // return it instead.
    if (typeIdByInstance.has(type)) {
      return typeIdByInstance.get(type) as TypeID;
    }

    if (type.flags & ts.TypeFlags.Boolean) {
      return pushType(type, 'keyword', { keyword: 'boolean' });
    }
    
    switch (type.flags) {
      case ts.TypeFlags.Union: {
        const unionType = type as ts.UnionType;
        return pushType(type, 'union', () => ({ unions: unionType.types.map(t => builder.fromTypeInstance(t)) }));
      }
      case ts.TypeFlags.Object: {
        const objectType = type as ts.ObjectType;

        if (objectType.objectFlags & ts.ObjectFlags.Reference) {
          const reference = objectType as ts.TypeReference;

          if (reference.target.objectFlags & ts.ObjectFlags.Tuple) {
            // special case: this is a tuple
            return pushType(type, 'tuple', () => ({
              elements: (reference.typeArguments || []).map(value => ({
                name: '',
                typeof: builder.fromTypeInstance(value)
              }))
            }))
          }
        }

        const signature = type.getCallSignatures()[0];
        if (signature) {
          return fromSignature(type, signature)
        }

        if (objectType.getProperties().length > 0) {
          const propertySymbols = checker.getPropertiesOfType(objectType)

          return pushType(type, 'object', () => ({
            meta: {
              resolvedBy: 'instance:objectWithProperties',
              objectFlags: objectType.objectFlags.toString(),
              symbol: type.symbol.name || '(no name)'
            },
            properties: propertySymbols.map(symbol => {
              const propertyType = checker.getTypeOfSymbol(symbol);
              return {
                identifier: symbol.name,
                typeof: builder.fromTypeInstance(propertyType)
              }
            })
          }))
        }
        return pushType(type, 'parser-error', () => ({ message: 'ObjectType ' + getFlags(ts.ObjectFlags as any, objectType.objectFlags) }))
      }
      case ts.TypeFlags.Undefined:
        return pushType(type, 'keyword', { keyword: 'undefined' });
      case ts.TypeFlags.Void:
      case ts.TypeFlags.VoidLike:
        return pushType(type, 'keyword', () => ({ keyword: 'void' as const }));
      case ts.TypeFlags.Null:
        return pushType(type, 'keyword', () => ({ keyword: 'null' as const }));
      case ts.TypeFlags.Number:
        return pushType(type, 'keyword', () => ({ keyword: 'number' as const }));
      case ts.TypeFlags.BooleanLiteral:
        return pushType(type, 'keyword', { keyword: 'boolean' });
        
      case ts.TypeFlags.Boolean:
      case ts.TypeFlags.NumberLiteral:
      case ts.TypeFlags.StringLiteral: {
        const stringLiteral = type as ts.StringLiteralType;
        return pushType(type, 'literal', () => ({ literal: stringLiteral.value }));
      }
      case ts.TypeFlags.String:
        return pushType(type, 'keyword', () => ({ keyword: 'string' } as const));
      case ts.TypeFlags.Any:
        return pushType(type, 'keyword', () => ({ keyword: 'any' } as const));
      case ts.TypeFlags.Intersection:
        const intersectionType = type as ts.IntersectionType;
        return pushType(type, 'intersection', () => ({
          intersections: intersectionType.types.map(type => builder.fromTypeInstance(type))
        }))
      case ts.TypeFlags.TypeParameter:
      case ts.TypeFlags.Union:
    }
    return pushType(type, 'parser-error', () => ({ message: 'RealType ' + getFlags(ts.TypeFlags as any, type.flags) }))
  }

  const fromSignature = (type: ts.Type, signature: ts.Signature) => {
    return pushType(type, 'function', () => {
      const typeParameters = (signature.typeParameters || []).map(typeParameter => {
        const decl = (typeParameter.symbol.declarations || [])[0] as ts.TypeParameterDeclaration
        
        return builder.fromTypeParameterDeclaration(decl)
      }).filter(x => !!x);

      const parameters = signature.parameters.map(param => {
        const type = checker.getTypeOfSymbol(param);
        
        return {
          identifier: param.name,
          typeof: type ? builder.fromTypeInstance(type) : pushType(type, 'parser-error', () => ({ message: `Symbol has no type`}))
        }
      })

      const returnType = checker.getReturnTypeOfSignature(signature);
      const returns = builder.fromTypeInstance(returnType)

      return {
        typeParameters,
        parameters,
        returns,
      }
    })
  };

  builder.fromTypeInstance = fromTypeInstance;
}