import { Component, h, Node } from '@lukekaalim/act';
import { Nodes as MdastNode, Paragraph } from 'mdast';
import { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx';

export type MarkdownComponentProps = {
  attributes: Record<string, string | number | boolean>
}

export type MarkdownComponent = Component<MarkdownComponentProps>;

export type OverrideComponentProps = {
  node: MdastNode,
  renderer: MdastRenderer,
  className: string,
  style: Record<string, unknown>,
}
export type OverrideComponent = Component<OverrideComponentProps>;

export type MarkdownRendererOptions = {
  components?: Record<string, MarkdownComponent>,
  overrides?: Record<string, OverrideComponent>,
  classNames?: { [key in (MdastNode["type"] | 'checkbox')]?: string },
  styles?: { [key in (MdastNode["type"] | 'checkbox')]?: Record<string, unknown> },
}
export type MdastRenderer = ReturnType<typeof createMdastRenderer>;

export const createMdastRenderer = (options: MarkdownRendererOptions = {}) => {
  const mdastToNode = (node: MdastNode): Node => {
    const className = (options.classNames || {})[node.type] || '';
    const style = (options.styles || {})[node.type] || {};
    const override = (options.overrides || {})[node.type]

    if (override) {
      return h(override, {
        node,
        renderer: mdastToNode,
        className,
        style,
      })
    }

    const props: Record<string, unknown> = {};
    if (className)
      props.className = className;
    if (style)
      props.style = style;

    switch (node.type) {
      case 'root':
        return node.children.map(mdastToNode);
      case 'heading':
        return h(`h${node.depth}`, { ...props }, node.children.map(mdastToNode));
      case 'text':
        return node.value;
      case 'paragraph':
        return h('p', { ...props }, node.children.map(mdastToNode));
  
      case 'blockquote':
        return h('blockquote', { ...props }, node.children.map(mdastToNode));
      case 'break':
        return h('br', props);
      case 'code':
      case 'inlineCode':
        return h('code', { ...props }, node.value);
      case 'image':
        return h('img', { ...props, src: node.url, alt: node.alt, title: node.title });
      case 'emphasis':
        return h('i', { ...props }, node.children.map(mdastToNode));
      case 'link':
        return h('a', { ...props, href: node.url }, node.children.map(mdastToNode));
      case 'list':
        return h('ul', { ...props }, node.children.map(mdastToNode));
      case 'listItem':
        if (node.checked !== null) {
          const checkboxProps = {
            type: 'checkbox',
            disabled: true,
            checked: node.checked,
            className: (options.classNames || {})['checkbox'],
            style: (options.styles || {})['checkbox'] || { display: 'inline' }
          }
          return h('li', { ...props }, [
            h('input', checkboxProps),
            (node.children[0] as Paragraph).children.map(mdastToNode),
            node.children.slice(1).map(mdastToNode),
          ]);
        }
        return h('li', { ...props }, (node.children[0] as Paragraph).children.map(mdastToNode));
      case 'table':
        return h('table', { ...props }, node.children.map(mdastToNode));
      case 'tableRow':
        return h('tr', { ...props }, node.children.map(mdastToNode));
      case 'tableCell':
        return h('td', { ...props }, node.children.map(mdastToNode));
      case 'strong':
        return h('strong', { ...props }, node.children.map(mdastToNode));

      case 'yaml':
      case 'mdxjsEsm':
        return h('pre', {}, 'Not Supported');
      case 'mdxJsxFlowElement':
      case 'mdxJsxTextElement':
        return mdxJsxFlowElementToNode(node);
      default:
        console.warn(`Unknown element "${node.type}"`, node)
        return null;
    }
  }

  const mdxJsxFlowElementToNode = (node: MdxJsxFlowElement | MdxJsxTextElement) => {
    console.log({ node });
    if (!node.name)
      return null;
    const component = (options.components || {})[node.name];

    const attributes = Object.fromEntries(node.attributes.map(attribute => {
      switch (attribute.type) {
        case 'mdxJsxAttribute':
          switch (typeof attribute.value) {
            case 'string':
              return [attribute.name, attribute.value];
            case 'object':
              if (attribute.value === null)
                return [];
              switch (attribute.value.type) {
                case 'mdxJsxAttributeValueExpression':
                  console.log(attribute.name, attribute.value.value)
                  return [attribute.name, JSON.parse(attribute.value.value)]
                default:
                  return [];
              }
          }
        case 'mdxJsxExpressionAttribute':
          return []
      }
    }))
    return h(component, { attributes }, node.children.map(mdastToNode))
  }

  return mdastToNode;
}
