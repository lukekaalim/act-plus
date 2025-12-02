export type DocSetup = {
  markdownComponents: Map<MDXComponentID, MDXComponent>,
  linkableReferences: Map<LinkableReferenceID, LinkableReference>,
  docPages:           Map<DocPageID, DocPage>,
};
