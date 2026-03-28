import { EchoExternalReference, EchoModule } from "@lukekaalim/echo"
import { EchoModuleContext } from "../utils/ModuleContext"
import { Component, h, Node } from "@lukekaalim/act"
import { Declaration } from "./Declaration"
import { EchoExternalDeclarationRenderer } from "../Echo"

export type ModuleRendererProps = {
  context: EchoModuleContext,
  module: EchoModule,

  header?: Node,
  noId?: boolean,
  debug?: boolean,
}

export const ModuleRenderer: Component<ModuleRendererProps> = ({
  context,
  module,
  header,
  children,
  noId = false,
  debug = false
}) => {
  
  const externalsByModule = new Map(Object.values(module.references).map(ref => [ref.module, [] as EchoExternalReference[]]))
  for (const ref of Object.values(module.references))
    (externalsByModule.get(ref.module) as EchoExternalReference[]).push(ref)

    
  return [
    header || h('h2', { id: `echo:${module.name}` }, module.name),
    children,
    module.exports.map(id => module.declarations[id])
      .map(declaration => h(Declaration, { noId, context, declaration })),

    debug && [
      h('h2', { id: 'Externals' }, `Externals`),
      [...externalsByModule.entries()]
        .map(([filename, declarations]) => [
          h('h3', { id: `echo:${filename}`}, filename),
          declarations.map(declaration => h(EchoExternalDeclarationRenderer, { module, declaration }))
        ])
    ]
  ]
}