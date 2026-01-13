import { Component, h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act"
import { ArticleKey, useDocApp } from "../../application"
import { buildNavTreeFromDOM, createNavTreeBuilder, NavTree2, useDocThemeContext } from "../../lib"
import { SidePanelContainer } from "../sidenav"
import { VerticalNavMenu2 } from "../vertical_nav_menu"
import { StaticMarkdownArticle } from "../article/MarkdownArticle"
import { InlineErrorBox } from "../debug"

export type ArticlePageProps = {
  articleKey: ArticleKey,
  navTree?: NavTree2
}

export const ArticlePage: Component<ArticlePageProps> = ({ articleKey, navTree }) => {
  const doc = useDocApp([]);
  const theme = useDocThemeContext();

  const ref = useRef<HTMLElement | null>(null)
  const [tree, setTree] = useState<NavTree2 | null>(null);

  useEffect(() => {
    const builder = createNavTreeBuilder();
    buildNavTreeFromDOM(builder, ref.current as HTMLElement);
    builder.trim();
    setTree(builder.tree);
  }, []);

  const routeTree = useMemo(() => navTree || doc.route.getNavTree(), [navTree])
  const article = useMemo(() => doc.article.articles.find(a => a.key === articleKey), [articleKey]);

  if (!article)
    return h(InlineErrorBox, {}, `No Article with key "${articleKey}" found in DocApp`)

  const node = h(SidePanelContainer, {
    left: h(theme.VerticalNav),
    right: tree && h(VerticalNavMenu2, { tree, rightAligned: true }),
  }, h(StaticMarkdownArticle, { root: article.content }))

  return h('div', { ref }, node);
}