import { Component, h } from '@lukekaalim/act';
import { DeclarationReflection } from 'typedoc';

export type DeclarationReflectionRendererProps = {
  declarationReflection: DeclarationReflection,
}

export const DeclarationReflectionRenderer: Component<DeclarationReflectionRendererProps> = ({
  declarationReflection
}) => {
  return h('h1', {}, declarationReflection.name)
}