import { Component, h, Node } from "@lukekaalim/act"
import { Echo, EchoReadingContext } from "@lukekaalim/echo"
import { IdentifierView } from "."
import { e } from "../../echo/sample/1"

/**
 * @expand
 */
export type EchoViewProps = {
  context: EchoReadingContext,
  echo: Echo,

  header?: Node,
  noId?: boolean,
  debug?: boolean,
}

export const EchoView: Component<EchoViewProps> = ({
  context,
  echo,
  header,
  children,
  noId = false,
  debug = false
}) => {
  //const externalsByModule = new Map(Object.values(module.references).map(ref => [ref.module, [] as EchoExternalReference[]]))

  //for (const ref of Object.values(module.references))
  //  (externalsByModule.get(ref.module) as EchoExternalReference[]).push(ref)

    
  return [
    header || h('h2', { id: `echo:${echo.moduleName}` }, echo.moduleName),
    children,
    echo.exports.map(id => {
      const identifier = context.getIdentifierOrThrow(id);

      if ((identifier.type === 'type-parameter') || identifier.type === 'external')
        return null;

      return h(IdentifierView, { noId, context, identifier });
    }),

    !!debug && [
      h('h2', { id: 'Comments' }, `Comments`),
      h('table', {}, [
        h('tr', {}, [h('th', {}, 'ID'), h('th', {}, 'identifierID'), h('th', {}, 'Member Name'), h('th', {}, 'Text')]),
        echo.comments.map(comment => {
          return h('tr', {}, [
            h('td', {}, comment.id),
            h('td', {}, comment.identifier),
            h('td', {}, comment.memberName),
            h('td', {}, comment.text),
          ])
        })
      ]),
      h('h2', { id: 'Externals' }, `Externals`),
      h('table', {}, [
        h('tr', {}, [h('th', {}, 'Name'), h('th', {}, 'Module')]),
        echo.identifiers.map(identifier => {
          if (identifier.type !== 'external')
            return null;

          return h('tr', {}, [
            h('td', {}, identifier.name),
            h('td', {}, identifier.moduleName),
          ])
        })
      ]),
      h('h2', { id: 'Errors' }, `Errors`),
      h('table', {}, [
        h('tr', {}, [h('th', {}, 'Category'), h('th', {}, 'Message'), h('th', {}, 'Source')]),
        echo.diagnostics.map(diagnostic => {
          return h('tr', {}, [
            h('td', {}, diagnostic.category),
            h('td', {}, diagnostic.message),
            h('td', {}, diagnostic.source),
          ])
        })
      ])
      ,
    ]
  ]
}