import ts from "typescript"
import { EchoDeclaration, EchoType } from "../reflections"
import { createId, getIdentifier } from "../utils"
import { ExternalTypeBuilder } from "./external"
import { TypeBuildContext } from "../types"
import { TypeInstanceBuilder } from "./instances"

export type DeclarationsTypeBuilder = {
  fromAnyTypeNode(node: ts.TypeNode): EchoType.ID,
  fromTypeParameterDeclaration(typeParameterDeclaration: ts.TypeParameterDeclaration): EchoDeclaration.ID
}

/**
 * This Builder can create EchoTypes from ts Type Declarations:
 * that is, fully statically defined types pulled from the
 * typescript AST.
 * 
 * As such, it doesn't require the typechecker and simply
 * traversed the nodes of the elements provided.
 */
export const createDeclarationBuilder = (
  context: TypeBuildContext,
  external: ExternalTypeBuilder,
  getInstanceBuilder: () => TypeInstanceBuilder,
): DeclarationsTypeBuilder => {
  const { checker } = context.ts;

  /**
   * Create a type, push it to the module's big list of types,
   * and return the type's id.
   * 
   * @param type the "type" of the EchoType.
   * @param props Any properties of the EchoType, excluding the "type" and "id" attributes.
   * @returns The ID of the new EchoType.
   */
  const pushType = <T extends EchoType["type"]>(type: T, props: Omit<EchoType.ByType<T>, "id" | "type">) => {
    const id = createId<"EchoTypeID">();
    const echoType = EchoType.create(type, id, props);
    context.types.set(id, echoType);
    return id;
  }
  

  const fromLiteralNode = (literalType: ts.LiteralTypeNode) => {
    switch (literalType.literal.kind) {
      case ts.SyntaxKind.StringLiteral:
        return pushType('literal', { value: literalType.literal.text })
      case ts.SyntaxKind.NullKeyword:
        return pushType('literal', { value: null });
      default:
        return pushType('unsupported', { message: `literal (${ts.SyntaxKind[literalType.literal.kind]})` })
    }
  }

  /**
   * This means an object "{ prop: value }" rather than a literal (value): "a literal string"
   * @param typeLiteralType
   */
  const fromTypeLiteralNode = (typeLiteralType: ts.TypeLiteralNode) => {
    return pushType('object', {
      properties: Object.fromEntries(typeLiteralType.members.map(member => {
        if (!member.name) {
          return ['unknown', pushType('unsupported', { message: `Unknown name` })]
        }
        // TODO: expand support for all the different kinds of property signatures
        // you can have on an object
        switch (member.kind) {
          case ts.SyntaxKind.PropertySignature:
            const propertySignature = member as ts.PropertySignature;
            if (!propertySignature.type)
              return [getIdentifier(member.name), pushType('unsupported', { message: `Unknown name` })]
            return [getIdentifier(member.name), fromAnyTypeNode(propertySignature.type)]
          case ts.SyntaxKind.MethodSignature:
            return ['unknown', pushType('unsupported', { message: `Unknown name` })]
          default:
          return ['unknown', pushType('unsupported', { message: `Unknown name` })]
        }
      }))
    })
  }

  const fromArrayTypeNode = (arrayType: ts.ArrayTypeNode) => {
    const element = fromAnyTypeNode(arrayType.elementType);
    return pushType('array', { element });
  }

  const fromIndexedAccessTypeNode = (indexedAccessType: ts.IndexedAccessTypeNode) => {
    return pushType ('indexed-access', {
      target: fromAnyTypeNode(indexedAccessType.objectType),
      accessor: fromAnyTypeNode(indexedAccessType.indexType),
    })
  }

  const fromTypeParameterDeclaration = (typeParam: ts.TypeParameterDeclaration) => {
    let extendsId = null;
    let defaultId = null;

    if (typeParam.constraint) {
      extendsId = fromAnyTypeNode(typeParam.constraint)
    }
    if (typeParam.default) {
      defaultId = fromAnyTypeNode(typeParam.default)
    }

    const typeParameterDeclaration = EchoDeclaration.create(createId(), 'generic', {
      identifier: typeParam.name.text,
      extends: extendsId,
      default: defaultId,
    })

    const symbol = checker.getSymbolAtLocation(typeParam.name);

    // Add the type parameter
    context.declarations.set(typeParameterDeclaration.id, typeParameterDeclaration);
    if (symbol)
      context.declarationBySymbol.set(symbol, typeParameterDeclaration.id);
    else
      console.warn(`Type parameter without symbol???`)

    return typeParameterDeclaration.id;
  }

  const fromFunctionTypeNode = (functionType: ts.FunctionTypeNode) => {
    const typeParameters = (functionType.typeParameters || []).map(fromTypeParameterDeclaration);

    return pushType('callable', {
      parameters: functionType.parameters.map(parameter => {
        return {
          name: getIdentifier(parameter.name),
          type: parameter.type ? fromAnyTypeNode(parameter.type) : pushType('unsupported', { message: '???' }),
          optional: !!parameter.questionToken
        }
      }),
      returns: fromAnyTypeNode(functionType.type),
      typeParameters
    })
  }

  const fromTypeReferenceNode = (reference: ts.TypeReferenceNode) => {
    let symbol = checker.getSymbolAtLocation(reference.typeName);

    if (!symbol) {
      throw new Error(`Unknown type reference`);
    }
    const typeParameters = (reference.typeArguments || []).map(fromAnyTypeNode);
    return pushType('reference', { target: external.getSymbolTarget(symbol), typeParameters });
  }

  const fromAnyTypeNode = (node: ts.TypeNode): EchoType.ID => {
    switch (node.kind) {
      case ts.SyntaxKind.UnknownKeyword:
        return pushType('keyword', { keyword: 'unknown' });
        
      case ts.SyntaxKind.StringKeyword:
        return pushType('builtin', { builtin: 'string' });
      case ts.SyntaxKind.NumberKeyword:
        return pushType('builtin', { builtin: 'number' });
      case ts.SyntaxKind.SymbolKeyword:
        return pushType('builtin', { builtin: 'symbol' });
      case ts.SyntaxKind.BooleanKeyword:
        return pushType('builtin', { builtin: 'boolean' });
      case ts.SyntaxKind.VoidKeyword:
        return pushType('keyword', { keyword: 'void' });
      case ts.SyntaxKind.AnyKeyword:
        return pushType('keyword', { keyword: 'any' });
      case ts.SyntaxKind.NeverKeyword:
        return pushType('keyword', { keyword: 'never' });
      case ts.SyntaxKind.UndefinedKeyword:
        return pushType('keyword', { keyword: 'undefined' });

      case ts.SyntaxKind.UnionType: {
        const branches = (node as ts.UnionTypeNode).types.map(fromAnyTypeNode)
        return pushType('union', { branches });
      }
      case ts.SyntaxKind.IntersectionType: {
        const branches = (node as ts.IntersectionTypeNode).types.map(fromAnyTypeNode)
        return pushType('intersection', { branches });
      }
      case ts.SyntaxKind.LiteralType:
        return fromLiteralNode(node as ts.LiteralTypeNode)
      case ts.SyntaxKind.TypeReference:
        return fromTypeReferenceNode(node as ts.TypeReferenceNode)
      case ts.SyntaxKind.TypeLiteral:
        return fromTypeLiteralNode(node as ts.TypeLiteralNode);
      case ts.SyntaxKind.ArrayType:
        return fromArrayTypeNode(node as ts.ArrayTypeNode);
      case ts.SyntaxKind.FunctionType:
        return fromFunctionTypeNode(node as ts.FunctionTypeNode);
      case ts.SyntaxKind.IndexedAccessType:
        return fromIndexedAccessTypeNode(node as ts.IndexedAccessTypeNode)
      case ts.SyntaxKind.TypeQuery:
        return getInstanceBuilder().fromType(checker.getTypeAtLocation(node as ts.TypeQueryNode))
      case ts.SyntaxKind.ParenthesizedType:
        return fromAnyTypeNode((node as ts.ParenthesizedTypeNode).type);
      default:
        return pushType('unsupported', { message: `Don't support Node "${ts.SyntaxKind[node.kind]}" yet`})
    }
  }

  return { fromAnyTypeNode, fromTypeParameterDeclaration }
}