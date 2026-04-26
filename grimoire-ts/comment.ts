import { h, Node } from '@lukekaalim/act';
import * as tsdoc from '@microsoft/tsdoc';
import { ParameterComment } from './components';

export const renderDocCommentNode = (node: tsdoc.DocNode): Node => {
  switch (node.kind) {
    case tsdoc.DocNodeKind.Comment:
      const comment = node as tsdoc.DocComment;
      return h('article', {}, [
        renderDocCommentNode(comment.summarySection),
        comment.params.blocks.map(param => renderDocCommentNode(param))
      ])
    case tsdoc.DocNodeKind.Paragraph:
      const paragraph = node as tsdoc.DocParagraph;
      return h('p', {}, paragraph.nodes.map(renderDocCommentNode));
    case tsdoc.DocNodeKind.Section:
      const section = node as tsdoc.DocSection;
      return h('section', {}, section.nodes.map(renderDocCommentNode))
    case tsdoc.DocNodeKind.PlainText:
      const plainText = node as tsdoc.DocPlainText;
      return plainText.text
    case tsdoc.DocNodeKind.SoftBreak:
      return '\n';
    case tsdoc.DocNodeKind.ParamBlock:
      const paramBlock = node as tsdoc.DocParamBlock
      return h(ParameterComment, {
        name: paramBlock.parameterName,
        description: renderDocCommentNode(paramBlock.content)
      })
    default:
      return `Unsupported (${node.kind})`
  }
}

export const renderDocComment = (docComment: tsdoc.DocComment) => {

}