import ts from "typescript";
import { EchoDeclaration, EchoType } from "./reflections";
import { getFlags, getIdentifier } from "./utils";

export const createTypeBuilder = (checker: ts.TypeChecker) => {
  let resolveDepth = Number.POSITIVE_INFINITY;

  const recordedTypes = new Map();

  const buildReference = (reference: ts.TypeReferenceNode): EchoType => {
    const resolvedReference = checker.getTypeAtLocation(reference.typeName);
    const typeParameters = (reference.typeArguments || []).map(param => buildType(param))
    
    const symbol = resolvedReference.getSymbol();
    reference.typeName

    if (symbol) {
      const name = checker.getFullyQualifiedName(symbol)
      return EchoType.create('reference', { name, typeParameters })
    }

    if (resolvedReference.flags & ts.TypeFlags.TypeParameter) {
      const typeParameter = resolvedReference as ts.TypeParameter;
      
      return EchoType.create('reference', { name: getIdentifier(reference.typeName), typeParameters })
    }

    const aliasSymbol = resolvedReference.aliasSymbol;
    if (!aliasSymbol) {
      return EchoType.create('reference', { name: getIdentifier(reference.typeName), typeParameters })
    }

    return EchoType.create('reference', { name: aliasSymbol.name, typeParameters });
    
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

  const getName = (propertyName: ts.PropertyName): string => {
    switch (propertyName.kind) {
      case ts.SyntaxKind.Identifier:
        return propertyName.text;
      default:
        return '[Unsupported name type]'
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
            return [getName(member.name), buildType(propertySignature.type)]
          case ts.SyntaxKind.MethodSignature:
            return ['unknown', EchoType.create('unsupported', { message: `Unknown name` })]
          default:
          return ['unknown', EchoType.create('unsupported', { message: `Unknown name` })]
        }
      }))
    })
  }

  const buildArrayType = (arrayType: ts.ArrayTypeNode) => {
    return EchoType.create('array', { element: buildType(arrayType.elementType) });
  }

  const buildIndexedAccessType = (indexedAccessType: ts.IndexedAccessTypeNode) => {
    return EchoType.create('indexed-access', {
      target: buildType(indexedAccessType.objectType),
      accessor: buildType(indexedAccessType.indexType)
    })
  }

  const buildType = (type?: ts.TypeNode): EchoType => {
    if(!type)
      return EchoType.create('unsupported', { message: 'No type provided' });

    switch (type.kind) {
      case ts.SyntaxKind.TypeReference:
        return buildReference(type as ts.TypeReferenceNode)
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
        return EchoType.create('union', { branches: (type as ts.UnionTypeNode).types.map(buildType) })
      case ts.SyntaxKind.IntersectionType:
        return EchoType.create('intersection', { branches: (type as ts.IntersectionTypeNode).types.map(buildType) })
      case ts.SyntaxKind.FunctionType:
        return buildFunction(type as ts.FunctionTypeNode);
      case ts.SyntaxKind.IndexedAccessType:
        return buildIndexedAccessType(type as ts.IndexedAccessTypeNode)
      default:
        return EchoType.create('unsupported', { message: `Don't support "${ts.SyntaxKind[type.kind]}" yet`})
    }
  }

  const buildDeclaration = (declaration: ts.TypeAliasDeclaration): EchoType => {
    return buildType(declaration.type);
  }

  const buildFunction = (functionType: ts.FunctionTypeNode): EchoType.Callable => {
    const typeParameters = Object.fromEntries((functionType.typeParameters || []).map(parameter => {
      const _extends = parameter.constraint && buildType(parameter.constraint) || null
      const _default = parameter.default && buildType(parameter.default) || null
      return [parameter.name.text, { extends: _extends, default: _default } as EchoDeclaration.TypeParameter]
    }))

    return EchoType.create('callable', {
      parameters: functionType.parameters.map(parameter => {
        return {
          name: getIdentifier(parameter.name),
          type: buildType(parameter.type),
          optional: !!parameter.questionToken
        }
      }),
      returns: buildType(functionType.type),
      typeParameters
    })
  }

  return {
    buildDeclaration,
    buildFunction,
    buildType,
  }
};
