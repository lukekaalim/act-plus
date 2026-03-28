import { EchoDeclaration, EchoModule, EchoTSDocComment } from "@lukekaalim/echo";

export type EchoModuleContext = {
  /**
   * Find any comment associated with a declaration
   */
  commentByDeclaration: Map<EchoDeclaration.ID, EchoTSDocComment>,
  /**
   * Declarations that are qualified by Namespaces 
   */
  namespacesByDeclarations: Map<EchoDeclaration.ID, EchoDeclaration.Namespace[]>,

  fullyQualifiedName: Map<EchoDeclaration.ID, string>,

  declarationByQualifiedName: Map<string, EchoDeclaration>,

  module: EchoModule,
};

export const createModuleContext = (module: EchoModule): EchoModuleContext => {
  const context: EchoModuleContext = {
    commentByDeclaration: new Map(),
    namespacesByDeclarations: new Map(),
    fullyQualifiedName: new Map(),
    declarationByQualifiedName: new Map(),
    module,
  };

  for (const comment of Object.values(module.comments)) {
    if (comment.target.type === 'declaration') {
      context.commentByDeclaration.set(comment.target.id, comment);
    }
  }

  for (const declaration of Object.values(module.declarations)) {
    if (declaration.type === 'generic') {
      context.namespacesByDeclarations.set(declaration.id, []);
    }
  }

  const visitExports = (exportedIds: EchoDeclaration.ID[], namespaces: EchoDeclaration.Namespace[]) => {
    for (const id of exportedIds) {
      const declaration = module.declarations[id];
      context.namespacesByDeclarations.set(declaration.id, namespaces);
      if (declaration.type === 'namespace') {
        visitExports(declaration.exports, [...namespaces, declaration]);
      }
    }
  }

  visitExports(module.exports, []);

  for (const [declarationId, namespaces] of context.namespacesByDeclarations) {
    const declaration = module.declarations[declarationId];
    const qualifiedName = [
      ...namespaces.map(namespace => namespace.identifier),
      declaration.identifier
    ].join('.')
    context.fullyQualifiedName.set(declarationId, qualifiedName)
    context.declarationByQualifiedName.set(qualifiedName, declaration);
  }


  return context;
}