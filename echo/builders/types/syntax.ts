import ts from "typescript"
import { TypeBuilder } from "./builder"
import { Identifier, IdentifierID } from "../../definitions/identifiers"
import { ModuleBuildContext } from "../echo"
import { Type, TypeID } from "../../definitions/type"
import { ExtractTypePropsByName } from "../../definitions/meta"
import { createId } from "../../utils"
import { Property } from "../../definitions/objects"

/**
 * Functions for building types based off the typescript AST
 */
export type SyntaxTypeBuilder = {
  fromAnyNode(node: ts.TypeNode): TypeID,

  fromTypeParameterDeclaration(typeParameterDeclaration: ts.TypeParameterDeclaration): IdentifierID,

  fromSignatureDeclaration(signatureDeclaration: ts.SignatureDeclarationBase): TypeID,
  
  fromFunctionDeclaration(functionDeclaration: ts.FunctionDeclaration): TypeID,
  fromClassDeclaration(classDeclaration: ts.ClassDeclaration): TypeID,
  fromInterfaceDeclaration(interfaceDeclaration: ts.InterfaceDeclaration): TypeID,
}

/**
 * This Builder can create EchoTypes from ts Type Declarations:
 * that is, fully statically defined types pulled from the
 * typescript AST.
 * 
 * As such, it doesn't require the typechecker and simply
 * traversed the nodes of the elements provided.
 */
export const createSyntaxTypeBuilder = (context: ModuleBuildContext, builder: TypeBuilder) => {
  const { checker } = context.ts;

  /**
   * Create a type, push it to the module's big list of types,
   * and return the type's id.
   * 
   * @param type the "type" of the EchoType.
   * @param props Any properties of the EchoType, excluding the "type" and "id" attributes.
   * @returns The ID of the new EchoType.
   */
  const pushType = <T extends Type["type"]>(type: T, props: ExtractTypePropsByName<T>) => {
    const id = createId<"TypeID">();
    const echoType = {
      type,
      id,
      ...props,
    } as Extract<Type, { type: T }>;
    context.types.set(id, echoType);
    return id;
  }
  

  const fromLiteralNode = (literalType: ts.LiteralTypeNode) => {
    switch (literalType.literal.kind) {
      case ts.SyntaxKind.StringLiteral:
        return pushType('literal', { literal: literalType.literal.text })
      case ts.SyntaxKind.FirstLiteralToken:
        return pushType('literal', { literal: Number(literalType.literal.text) })
      case ts.SyntaxKind.NullKeyword:
        return pushType('keyword', { keyword: 'null' });
      default:
        return pushType('parser-error', { message: `literal (${ts.SyntaxKind[literalType.literal.kind]})` })
    }
  }

  /**
   * This means an object "{ prop: value }" rather than a literal (value): "a literal string"
   * @param typeLiteralType
   */
  const fromTypeLiteralNode = (typeLiteralType: ts.TypeLiteralNode) => {
    return pushType('object', {
      properties: typeLiteralType.members.map((member): Property => {
        if (!member.name) {
          return { identifier: 'unknown', typeof: pushType('parser-error', { message: `Unknown name` }) }
        }
        if (member.name.kind !== ts.SyntaxKind.Identifier) {
          return { identifier: 'unknown', typeof: pushType('parser-error', { message: `Name too complex` }) }
        }
        const identifier = member.name as ts.Identifier;
        // TODO: expand support for all the different kinds of property signatures
        // you can have on an object
        switch (member.kind) {
          case ts.SyntaxKind.PropertySignature:
            const propertySignature = member as ts.PropertySignature;
            if (!propertySignature.type)
              return { identifier: identifier.text, typeof: builder.fromTypeInstance(checker.getTypeAtLocation(propertySignature)) }

            return { identifier: identifier.text, typeof: builder.fromAnyNode(propertySignature.type) }
          case ts.SyntaxKind.MethodSignature:
            const methodSignature = member as ts.MethodSignature;
            
            return { identifier: identifier.text, typeof: builder.fromSignatureDeclaration(methodSignature) }
          default:
            return { identifier: identifier.text, typeof: pushType('parser-error', { message: `"${ts.SyntaxKind[member.kind]}" not supported yet` }) }
        }
      })
    })
  }

  const fromArrayTypeNode = (arrayType: ts.ArrayTypeNode) => {
    const element = fromAnyTypeNode(arrayType.elementType);
    return pushType('array', { element });
  }

  const fromIndexedAccessTypeNode = (indexedAccessType: ts.IndexedAccessTypeNode) => {
    return pushType ('index-access', {
      target: fromAnyTypeNode(indexedAccessType.objectType),
      index: fromAnyTypeNode(indexedAccessType.indexType),
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

    const typeParameterIdentifier: Identifier = {
      id: createId(),
      name:  typeParam.name.text,
      type: 'type-parameter',
      constraint: extendsId,
      default: defaultId,
    }

    const symbol = checker.getSymbolAtLocation(typeParam.name);

    // Add the type parameter
    context.identifiers.set(typeParameterIdentifier.id, typeParameterIdentifier);
    if (symbol)
      context.identifierBySymbol.set(symbol, typeParameterIdentifier.id);
    else
      console.warn(`Type parameter without symbol???`)

    return typeParameterIdentifier.id;
  }

  const fromFunctionTypeNode = (functionType: ts.FunctionTypeNode) => {
    const typeParameters = (functionType.typeParameters || []).map(fromTypeParameterDeclaration);

    return pushType('function', {
      parameters: functionType.parameters.map(parameter => {
        const name = functionType.name;
        const parameterType = parameter.type ? builder.fromAnyNode(parameter.type) : builder.fromTypeInstance(checker.getTypeAtLocation(parameter));
        if (name && name.kind === ts.SyntaxKind.Identifier) {
          return {
            identifier: name.text,
            typeof: parameterType,
          }
        }
        return {
          identifier: 'kinda hard to tell',
          typeof: parameterType
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
    if (context.symbolsToExpand.has(symbol)) {
      console.log(`Expanding symbol: "${symbol.name}"`)
      return builder.fromTypeInstance(checker.getTypeAtLocation(reference), true);
    }

    const parameters = (reference.typeArguments || []).map(fromAnyTypeNode);
    const target = builder.getIdentifierFromSymbol(symbol);
    if (!target) {
      const declaration = (symbol.declarations || [])[0];

      return pushType('parser-error', { message: `No Target for symbol (${symbol.name}, ${ts.SyntaxKind[declaration.kind]})` })
    }
    return pushType('reference', { target, parameters });
  }

  const fromAnyTypeNode = (node: ts.TypeNode): TypeID => {
    switch (node.kind) {
      case ts.SyntaxKind.UnknownKeyword:
        return pushType('keyword', { keyword: 'unknown' });
        
      case ts.SyntaxKind.StringKeyword:
        return pushType('keyword', { keyword: 'string' });
      case ts.SyntaxKind.NumberKeyword:
        return pushType('keyword', { keyword: 'number' });
      case ts.SyntaxKind.SymbolKeyword:
        return pushType('keyword', { keyword: 'symbol' });
      case ts.SyntaxKind.BooleanKeyword:
        return pushType('keyword', { keyword: 'boolean' });
      case ts.SyntaxKind.VoidKeyword:
        return pushType('keyword', { keyword: 'void' });
      case ts.SyntaxKind.AnyKeyword:
        return pushType('keyword', { keyword: 'any' });
      case ts.SyntaxKind.NeverKeyword:
        return pushType('keyword', { keyword: 'never' });
      case ts.SyntaxKind.UndefinedKeyword:
        return pushType('keyword', { keyword: 'undefined' });

      case ts.SyntaxKind.UnionType: {
        const unions = (node as ts.UnionTypeNode).types.map(fromAnyTypeNode)
        return pushType('union', { unions });
      }
      case ts.SyntaxKind.IntersectionType: {
        const intersections = (node as ts.IntersectionTypeNode).types.map(fromAnyTypeNode)
        return pushType('intersection', { intersections });
      }
      case ts.SyntaxKind.LiteralType:
      case ts.SyntaxKind.FirstLiteralToken:
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
        return builder.fromTypeInstance(checker.getTypeAtLocation(node as ts.TypeQueryNode))
      case ts.SyntaxKind.ParenthesizedType:
        return fromAnyTypeNode((node as ts.ParenthesizedTypeNode).type);
      case ts.SyntaxKind.TypeOperator: {
        const typeOperator = node as ts.TypeOperatorNode;
        const target = builder.fromAnyNode(typeOperator.type);
        switch (typeOperator.operator) {
          case ts.SyntaxKind.KeyOfKeyword:
            return builder.fromTypeInstance(checker.getTypeAtLocation(node))

            return pushType('operation', { operation: 'keyof', target })
          case ts.SyntaxKind.ReadonlyKeyword:
            return pushType('operation', { operation: 'readonly', target })
          case ts.SyntaxKind.UniqueKeyword:
            return pushType('operation', { operation: 'unique', target })
        }
      }
      case ts.SyntaxKind.ConditionalType:
        // handle conditional types
      default:
        return pushType('parser-error', { message: `Don't support Node "${ts.SyntaxKind[node.kind]}" yet`})
    }
  }
  

  builder.fromAnyNode = fromAnyTypeNode;
  builder.fromTypeParameterDeclaration = fromTypeParameterDeclaration;
  builder.fromFunctionDeclaration = (functionDeclaration) => {
    const functionInstance = checker.getTypeAtLocation(functionDeclaration);
    const signature = checker.getSignaturesOfType(functionInstance, ts.SignatureKind.Call)[0];

    let returns;
    if (functionDeclaration.type) {
      returns = builder.fromAnyNode(functionDeclaration.type);
    } else {
      returns = builder.fromTypeInstance(signature.getReturnType());
    }

    const parameters = functionDeclaration.parameters.map((parameter, parameterIndex) => {
      if (parameter.type) {
        return {
          identifier: 'placeholder name',
          typeof: builder.fromAnyNode(parameter.type)
        };
      } else {
        const parameterType = checker.getTypeAtLocation(parameter);
        return {
          identifier: 'placeholder name',
          typeof: builder.fromTypeInstance(parameterType)
        };
      }
    })
    const typeParameters = (functionDeclaration.typeParameters || []).map(typeParameter => {
      return builder.fromTypeParameterDeclaration(typeParameter)
    })

    return pushType('function', {
      parameters,
      typeParameters,
      returns,
    })
  };
  builder.fromClassDeclaration = (classDeclaration) => {
    return pushType('class', {
      properties: [],
      implements: [],
      abstract: false,
      extends: null,
    })
  }
  builder.fromSignatureDeclaration = (signature) => {
    const instance = checker.getTypeAtLocation(signature);
    const signatureInstance = instance.getCallSignatures()[0]

    return pushType('function', {
      typeParameters: (signature.typeParameters || []).map(typeParameter => {
        const parameterId = builder.fromTypeParameterDeclaration(typeParameter);
        return parameterId;
      }),
      parameters: signature.parameters.map(parameter => {
        let identifier = 'unknown'
        if (parameter.name.kind === ts.SyntaxKind.Identifier)
          identifier = parameter.name.text;
        let type: TypeID;
        if (parameter.type)
          type = builder.fromAnyNode(parameter.type);
        else 
          type = builder.fromTypeInstance(checker.getTypeAtLocation(parameter));

        return { identifier, typeof: type };
      }),
      returns: signature.type ? builder.fromAnyNode(signature.type) : builder.fromTypeInstance(signatureInstance.getReturnType())
    })
  }
}