import { Component, h, useMemo } from "@lukekaalim/act";
import { AnalysisFragment } from "./analysis";
import { defaultMdxComponentMap } from "@lukekaalim/act-doc/components/article/MDXContext";
import { CodeBox } from "@lukekaalim/act-doc";
import { createSyntaxRenderer } from "./syntax";
import { DocTsRegistry } from "./registry";
import { FragmentRenderer, getFragmentHtmlId } from "./fragment";

export type DocTsProps = {
  fragment?: AnalysisFragment,
  fragments?: AnalysisFragment[]
  namespace?: string,
};

const flattenFragments = (fragment: AnalysisFragment): AnalysisFragment[] => {
  return [fragment, ...fragment.children.map(flattenFragments).flat(1)]
}

export const DocTs: Component<DocTsProps> = ({ fragment, fragments, namespace = 'global' }) => {
  const fragmentsToRender = useMemo(() =>
    fragments || (fragment && [fragment]) || [],
    [fragment, fragments]
  );

  const lines = useMemo(() => {
    return fragmentsToRender.map((fragment, i) => {
      const renderer = createSyntaxRenderer((identifier, identifierNamespace) => {
        if (identifierNamespace)
          return DocTsRegistry.global.getReference(identifier, identifierNamespace);
        return DocTsRegistry.global.getReference(identifier, namespace)
          || DocTsRegistry.global.getReference(identifier)
      });

      renderer.renderNode(fragment.syntax);
      if (i < fragmentsToRender.length - 1)
        return [...renderer.getLines(), null];

      return renderer.getLines();
    }).flat(1)
  }, [fragmentsToRender])

  return h('div', {}, [
    h(CodeBox, { lines }),
      h('dl', {}, fragmentsToRender.map(fragment =>
        h(FragmentRenderer, { fragment })),
    )
  ])
};

defaultMdxComponentMap.set('DocTs', ({ attributes }) => {
  const namespace = attributes.namespace as string | undefined;
  const identifier = attributes.identifier as string || '';
  const identifiers = attributes.identifiers as string || '';

  if (identifiers) {
    const fragments = identifiers.split(',').map(identifier => {
      return DocTsRegistry.global.getFragment(identifier, namespace);
    }).filter((x): x is AnalysisFragment => !!x)

    return h(DocTs, { fragments, namespace });
  }

  const fragment = DocTsRegistry.global.getFragment(identifier, namespace);
  if (!fragment)
    return `Fragment "${namespace}:${identifier}" not found`;

  return h(DocTs, { fragment, namespace });
})