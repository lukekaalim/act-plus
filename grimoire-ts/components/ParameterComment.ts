import { Component, h, Node } from "@lukekaalim/act";

export type ParameterCommentProps = {
  id?: string,

  name: string,

  typeName?: string,
  typeLinkURL?: string,

  description: Node,
};

export const ParameterComment: Component<ParameterCommentProps> = ({ id, name, typeName, typeLinkURL, description }) => {
  return [
    h('div', { id }, [
      name,
      !!typeName && (typeLinkURL
        ? h('a', { href: typeLinkURL }, typeName)
        : typeName)
    ]),
    h('div', {}, description)
  ];
}