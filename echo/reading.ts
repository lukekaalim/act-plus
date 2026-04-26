import { Echo, Type, TypeID, Identifier, IdentifierID, Comment, CommentID } from "./definitions";

export type EchoReadingContext = {
  echo: Echo,

  types: Map<TypeID, Type>,
  identifiers: Map<IdentifierID, Identifier>,
  comments: Map<CommentID, Comment>,

  identifiersByName: Map<string, IdentifierID[]>,
  commentByTypeID: Map<TypeID, CommentID>,
  commentByTypeIDAndMember: Map<TypeID, Map<string, CommentID>>,
  qualifiedNameByIdentifier: Map<IdentifierID, string>,


  getTypeOrThrow(id: TypeID): Type,
  getIdentifierOrThrow<T extends Identifier["type"] = Identifier["type"]>(id: IdentifierID, expectedType?: T): Extract<Identifier, { type: T }>
};

export const createEchoReadingContext = (echo: Echo) => {
  const context: EchoReadingContext = {
    echo,

    types: new Map(echo.types.map(t => [t.id, t])),
    identifiers: new Map(echo.identifiers.map(i => [i.id, i])),
    comments: new Map(echo.comments.map(c => [c.id, c])),

    identifiersByName: new Map(),

    commentByTypeID: new Map(),
    commentByTypeIDAndMember: new Map(),
    qualifiedNameByIdentifier: new Map(),

    getTypeOrThrow(id: TypeID) {
      const type = context.types.get(id);
      if (!type)
        throw new Error(`Type "${id}" not found`);
      return type;
    },
    getIdentifierOrThrow<T extends Identifier["type"] = Identifier["type"]>(id: IdentifierID, expectedType?: T): Extract<Identifier, { type: T }> {
      const identifier = context.identifiers.get(id);
      if (!identifier)
        throw new Error();
      if (expectedType) {
        if (expectedType !== identifier.type)
          throw new Error();
      }
      return identifier as Extract<Identifier, { type: T }> ;
    }
  }

  for (const comment of echo.comments) {
    if (comment.memberName) {
      context.commentByTypeID.set(comment.typeId, comment.id);
    } else {
      const memberMap = context.commentByTypeIDAndMember.get(comment.typeId) || new Map();
      if (memberMap.size === 0) {
        context.commentByTypeIDAndMember.set(comment.typeId, memberMap);
      }
      memberMap.set(comment.memberName, comment.id);
    }
  }

  const visitNamespace = (qualifiers: string[], identifierId: IdentifierID) => {
    const identifier = context.identifiers.get(identifierId);
    if (!identifier)
      throw new Error(`${qualifiers.join('.')} (${identifierId}) identifier not found in namespace`)

    const qualifiedName = [...qualifiers, identifier.name].join('.');

    context.qualifiedNameByIdentifier.set(identifier.id, qualifiedName);
    if (identifier.type === 'type') {
      const type = context.types.get(identifier.typeId) as Type;
      if (type.type === 'namespace') {
        for (const exportedIdentifierId of type.exports) {
          visitNamespace([...qualifiers, type.name], exportedIdentifierId);
        }
      }
    }
  };
  for (const exportedIdentifierId of echo.exports) {
    visitNamespace([], exportedIdentifierId);
  }

  for (const identifier of echo.identifiers) {
    if (identifier.type === 'external' || identifier.type === 'type-parameter') {
      context.qualifiedNameByIdentifier.set(identifier.id, identifier.name);
      continue;
    }
    
    const identifierArray = context.identifiersByName.get(identifier.name) || [];
    const qualifiedName = context.qualifiedNameByIdentifier.get(identifier.id) as string;

    if (identifierArray.length === 0) {
      context.identifiersByName.set(qualifiedName, identifierArray);
    }
    identifierArray.push(identifier.id);
  }

  return context;
}