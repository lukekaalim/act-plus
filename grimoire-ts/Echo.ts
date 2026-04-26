import { createPlugin, InlineErrorBox, MDXComponent } from "@lukekaalim/grimoire";
import { createEchoReadingContext, Echo, EchoReadingContext } from "@lukekaalim/echo";
import { h} from "@lukekaalim/act";

import { visit } from "unist-util-visit";
import { buildMdxAttributes } from "@lukekaalim/act-markdown";
import { IdentifierView } from "./components/IdentifierView";
import { EchoView } from "./components";

export type EchoPlugin = typeof EchoPlugin;
export const EchoPlugin = createPlugin('echo', (core) => {
  const moduleContexts = new Map<string, EchoReadingContext>()

  const EchoMDXRenderer: MDXComponent = ({ attributes, children }) => {
    const moduleId = attributes['module'] as string;
    const qualifiedName = attributes['name'] as string;

    const context = moduleContexts.get(moduleId);
    if (!context)
      return h(InlineErrorBox, {}, `No module of id "${moduleId}" found`)

    const identifierId = (context.identifiersByName.get(qualifiedName) || [])[0];
    const identifier = context.identifiers.get(identifierId)

    if (!qualifiedName)
      return h(EchoView, { context, echo: context.echo });

    if (!identifier || (identifier.type !== 'value' && identifier.type !== 'type'))
      return h(InlineErrorBox, {}, `No declaration of name "${qualifiedName}" found`)

    return h(IdentifierView, { identifier, context }, children);
  }

  const EchoModuleMDXRenderer: MDXComponent = ({ attributes, children }) => {
    const moduleId = attributes['module'] as string;
    const context = moduleContexts.get(moduleId);
    if (!context)
      return h(InlineErrorBox, {}, `No module of id "${moduleId}" found`)

    const headingText = attributes['heading'] as string || moduleId;
    const noId = !!attributes['no-id'];
  
    return h(EchoView, { noId, echo: context.echo, context, header: headingText || null }, children)
  }

  const addModuleReference = (path: string, context: EchoReadingContext) => {
    for (const identifier of Object.values(context.echo.identifiers)) {
      const fullyQualifiedName = context.qualifiedNameByIdentifier.get(identifier.id) as string;

      const key = `echo:${context.echo.moduleName}:${fullyQualifiedName}`;
      core.reference.add(key, path, key)
    }
  }

  core.component.add('Echo', EchoMDXRenderer)
  core.component.add('EchoModule', EchoModuleMDXRenderer)

  core.article.addArticlePreprocessor((article) => {
    visit(article.content, 'mdxJsxFlowElement', node => {
      if (node.name === "EchoModule") {
        const attributes = buildMdxAttributes(node);
        const context = moduleContexts.get(attributes['module']);
        if (!context)
          return;

        for (const exportId of Object.values(context.echo.exports)) {
          const fullyQualifiedName = context.qualifiedNameByIdentifier.get(exportId) as string;

          const key = `echo:${context.echo.moduleName}:${fullyQualifiedName}`;
          core.reference.addIndirect(key, `article:${article.key}`, key)
        }
      }
      if (node.name === 'Echo') {
        const attributes = buildMdxAttributes(node);
        const context = moduleContexts.get(attributes['module']);
        const qualifiedName = attributes['name'] as string;

        if (!context)
          return;

        if (!qualifiedName) {
          for (const exportId of Object.values(context.echo.exports)) {
            const fullyQualifiedName = context.qualifiedNameByIdentifier.get(exportId) as string;

            const key = `echo:${context.echo.moduleName}:${fullyQualifiedName}`;
            core.reference.addIndirect(key, `article:${article.key}`, key)
          }
          return;
        }

        const declarations = context.identifiersByName.get(qualifiedName);

        if (!declarations || declarations.length !== 1)
          return;

        const declaration = declarations[0];

        const key = `echo:${context.echo.moduleName}:${qualifiedName}`;
        core.reference.addIndirect(key, `article:${article.key}`, key);
      }
    })
  })

  return {
    moduleContexts,
    addModuleReference,
    addModule(echo: Echo) {
      const context = createEchoReadingContext(echo)
      moduleContexts.set(echo.moduleName, context);
      return context;
    },
  }
});