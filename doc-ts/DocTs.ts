import { Component, h, useMemo } from "@lukekaalim/act";
import { AnalysisFragment } from "./analysis";
import { defaultMdxComponentMap } from "@lukekaalim/act-doc/components/article/MDXContext";
import { CodeBox } from "@lukekaalim/act-doc";
import { createSyntaxRenderer } from "./syntax";
import { DocTsRegistry } from "./registry";
import { FragmentRenderer, getFragmentHtmlId } from "./fragment";

export type DocTsProps = {
  fragment: AnalysisFragment,
  namespace?: string,
};

const flattenFragments = (fragment: AnalysisFragment): AnalysisFragment[] => {
  return [fragment, ...fragment.children.map(flattenFragments).flat(1)]
}

export const DocTs: Component<DocTsProps> = ({ fragment, namespace = 'global' }) => {
  const lines = useMemo(() => {
    const renderer = createSyntaxRenderer((identifier, identifierNamespace) => {
      if (identifierNamespace)
        return DocTsRegistry.global.getReference(identifier, identifierNamespace);
      return DocTsRegistry.global.getReference(identifier, namespace)
        || DocTsRegistry.global.getReference(identifier)
    });

    renderer.renderNode(fragment.syntax);
    return renderer.getLines();
  }, [fragment.syntax])

  return h('div', { id: getFragmentHtmlId(fragment) }, [
    h(CodeBox, { lines }),
    h('dl', {},
      h(FragmentRenderer, { fragment }),
    )
  ])
};

defaultMdxComponentMap.set('DocTs', ({ attributes }) => {
  const namespace = attributes.namespace as string | undefined;
  const identifier = attributes.identifier as string || '';

  const fragment = DocTsRegistry.global.getFragment(identifier, namespace);
  if (!fragment)
    return `Fragment "${namespace}:${identifier}" not found`;

  return h(DocTs, { fragment, namespace });
})