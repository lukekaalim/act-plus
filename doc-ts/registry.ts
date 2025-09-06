import ts from "typescript";
import { AnalysisFragment, analyzeSourceFile, SourceFileAnalysis } from "./analysis";
import { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { buildMdxAttributes } from "@lukekaalim/act-markdown";
import { getFragmentHtmlId } from "./fragment";

export type AnalysisReference = {
  namespace: string,
  identifier: string,
  href: string,
}

type NamespaceAnalysis = {
  name: string,
  sources: ts.SourceFile[]
  fragments: AnalysisFragment[],
  typeByIdentifier: Map<string, AnalysisFragment>,
  valueByIdentifier: Map<string, AnalysisFragment>,
  references: Map<string, AnalysisReference>,
};
const mergeAnalysisIntoNamespace = (namespace: NamespaceAnalysis, file: SourceFileAnalysis) => {
  namespace.sources.push(file.source);
  namespace.fragments.push(...file.allFragments);
  for (const [key, value] of file.typeByIdentifier)
    namespace.typeByIdentifier.set(key, value);
  for (const [key, value] of file.valueByIdentifier) {
    namespace.valueByIdentifier.set(key, value);
    console.log(`Adding ${key} to namespace ${namespace.name}`)
  }
}

export const createDocTsRegistry = (): DocTsRegistry => {
  const namespaceAnalyses = new Map<string, NamespaceAnalysis>();

  const getOrCreateNamespace = (namespace: string) => {
    const namespaceAnalysis = namespaceAnalyses.get(namespace)
    if (namespaceAnalysis)
      return namespaceAnalysis;

    const newNamespace = {
      name: namespace,
      sources: [],
      fragments: [],
      valueByIdentifier: new Map(),
      typeByIdentifier: new Map(),
      references: new Map(),
    };
    namespaceAnalyses.set(namespace, newNamespace);
    return newNamespace;
  }
  
  return {
    loadCode(namespace, sourceCode, filename) {
      const sourceFile = ts.createSourceFile(
        filename || `${namespace}.ts`,
        sourceCode,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
      );
      const sourceFileAnalysis = analyzeSourceFile(sourceFile);
      const namespaceAnalysis = getOrCreateNamespace(namespace);
      mergeAnalysisIntoNamespace(namespaceAnalysis, sourceFileAnalysis);
    },
    loadArticleReferences(pageURL, markdown) {
      visit(markdown, (node) => {
        if (node.type === 'mdxJsxFlowElement') {
          if (node.name === 'DocTs') {
            const attributes = buildMdxAttributes(node);
            const namespace = attributes.namespace as string;
            const identifier = attributes.identifier as string;
            const namespaceAnalysis = namespaceAnalyses.get(namespace);
            if (!namespaceAnalysis)
              return null;
            const fragment = namespaceAnalysis.typeByIdentifier.get(identifier);
            if (!fragment)
              return null;
            const pushFragment = (fragment: AnalysisFragment) => {
              const url = new URL(pageURL);
              url.hash = getFragmentHtmlId(fragment)
              namespaceAnalysis.references.set(fragment.identifier, {
                namespace,
                identifier,
                href: url.href
              })
              for (const child of fragment.children)
                pushFragment(child);
            }
            pushFragment(fragment);
            console.log(`Added reference for ${namespace}:${identifier}`)
          }
        }
      })
    },
    addReference(namespace, identifier, href) {
      const namespaceAnalysis = getOrCreateNamespace(namespace);
      namespaceAnalysis.references.set(identifier, {
        namespace,
        identifier,
        href
      })
    },
    getReference(identifier, namespace = 'global') {
      const namespaceAnalysis = namespaceAnalyses.get(namespace);
      if (!namespaceAnalysis)
        return null;
      const reference = namespaceAnalysis.references.get(identifier);
      if (!reference)
        return null;
      return reference;
    },
    getFragment(identifier, namespace = 'global') {
      const namespaceAnalysis = namespaceAnalyses.get(namespace);
      if (!namespaceAnalysis)
        return null;
      return namespaceAnalysis.typeByIdentifier.get(identifier)
        || namespaceAnalysis.valueByIdentifier.get(identifier)
        || null;
    },
  }
};

/**
 * An object that contains information about various pieces
 * of typescript code.
 * 
 * The Registry keeps track of various identifiers, based
 * on the SourceCodeAnalysis objects that it might consume/generate,
 * so that you can later query for a identifier + namespace and recieve
 * an AnalysisFragment
 * 
   * Access the global singleton registry via `DocTsRegistry.global`
 */
export type DocTsRegistry = {
  /**
   * Load a source code string into the registry, first transforming it into a
   * typescript SourceFile using the compiler, and creating a SourceCodeAnalysis
   * object, submitting all the fragments to the registry.
   * 
   * 
   * @param sourceCode The string of typescript source code to consume
   * @param optionals 
   */
  loadCode(namespace: string, sourceCode: string, filename?: string): void,
  /**
   * Load an MDAST Root Node into the registry, as well as a pageURL
   * it is expected to be visible on. Any MDX `<DocTs>` elements
   * will be found, and their identifiers will be added as "references", marking
   * the page and the URL hash as place that you can visit to learn more about
   * a given type.
   * @param pageURL The URL of the page (host + path) that the markdown should
   * be visible on
   * @param markdownAST An MDAST syntax tree. Get one
   * from calling `remark.parse(markdownText)` or any other MDAST emitting
   * markdown parsing library.
   */
  loadArticleReferences(pageURL: URL, markdownAST: Root): void,
  addReference(namespace: string, identifier: string, href: string): void,

  /**
   * Retreive an Analaysis Fragment by identifier.
   * @param identifier 
   * @param namespace Optional. The default namespace is `global`
   */
  getFragment(identifier: string, namespace?: string): null | AnalysisFragment,
  /**
   * 
   * @param identifier 
   * @param namespace Optional. The default namespace is `global`
   */
  getReference(identifier: string, namespace?: string): null | AnalysisReference,
};

export const DocTsRegistry = {
  global: createDocTsRegistry()
}