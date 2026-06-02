import { Component, h, useMemo, useState } from "@lukekaalim/act"
import { DocApp, DocAppContext } from "./application"
import { DocTheme, NavTree2, themeContext } from "./lib"
import { v2 } from "@lukekaalim/act-router"
import { PageContent } from "./application/Page"
import { BannerLink, Breadcrumbs, TableOfContents, TableOfContentsHeading, TableOfContentsLink, TableOfContentsTitle } from "./components"
import { kebabCase } from "change-case"
import { IconLink } from "./components/icon"
import { PaginationNav } from "./components/article/PaginationNav"
import { getBookPaginationLinks } from "./lib/book"

/**
 * @expand
 */
export type DocSiteProps = {
  theme: DocTheme,
  app: DocApp,
}

export const DocSite: Component<DocSiteProps> = ({ theme, app }) => {
  const [router] = useState(() => new v2.URLRouter(document.location.href));

  v2.useDOMIntegration(router);

  const location = v2.useRouterLocation(router);

  const path = location.pathname.split('/').filter(Boolean).join('/').toLocaleLowerCase() || '/';

  const currentPage = app.page.pages.get(path);

  // KLUDGE: need to find a more elegant way to express this...
  const renderPageContent = () => {
    if (!currentPage)
      return h(theme.NotFound, {}, h('p', {}, `Could not find content for path "${path}"`));

    const { content } = currentPage;
    switch (content.type) {
      case 'node':
        return content.node;

      case 'article':
        const article = app.article.articles.find(a => a.key === content.articleKey);
        if (!article)
          return h(theme.NotFound, {}, h('p', {}, `Could not find article of key "${content.articleKey}"`));

        const bookRef = app.page.bookRefByPath.get(path);
        const landing = app.page.landings
          .find(l => path.startsWith(l.path) && path !== l.path);

        let pagination = null;
        let right = null;
        const map = app.article.maps.get(content.articleKey);
        if (map) {
          right = h(TableOfContents, { sections: [{ heading: null, links: map.destinations
            .filter(destination => destination.depth > 1 && destination.depth < 4)
            .map(destination => {
              return h(TableOfContentsLink, { href: '#' + destination.fragment }, destination.name)
            })}]})
          right = h(theme.Sidebar, {}, right);
        }
        let left = null;


        if (bookRef) {
          const { book, section, page } = bookRef;
          left = h(theme.Sidebar, {}, [
            !!landing && h('div', { style: { 'margin-bottom': '8px' }}, [
              h(IconLink, { href: '/' + landing.path }, `Back to ${landing.name}`),
            ]),
            h(TableOfContents, { sections: [
              {
                heading: h(TableOfContentsTitle, {
                  href: book.top.index && '/' + book.top.index.path
                }, book.name),
                links: book.top.pages.map(a => h(TableOfContentsLink, { href: '/' + a.path }, a.name))
              },
              ...book.sections.map(section => {
                return {
                  heading: h(TableOfContentsHeading, { href: section.index && '/' + section.index.path }, section.name),
                  links: section.pages.map(page => {
                    return h(TableOfContentsLink, { href: '/' + page.path }, page.name)
                  })
                }
              })
            ] })])

            const paginationLinks = getBookPaginationLinks(bookRef)

            pagination = h(PaginationNav, {
              left: paginationLinks.prev &&
                h(PaginationNav.Link, {
                  href: '/' + paginationLinks.prev.path,
                  title: paginationLinks.prev.name  || paginationLinks.prev.sectionName || book.name,
                  direction: 'Previous'
                }),
              right: paginationLinks.next &&
                h(PaginationNav.Link, {
                  href: '/' + paginationLinks.next.path,
                  title: paginationLinks.next.name || paginationLinks.next.sectionName || book.name,
                  direction: 'Next'
                }),
            })
        }
        const breadcrumbs = !!bookRef && h(Breadcrumbs, { links: [
          landing && { name: landing.name, path: landing.path },
          { name: bookRef.book.name, path: bookRef.book.basePath },
          bookRef.section.name && { name: bookRef.section.name, path: bookRef.section.path },
          bookRef.page.name !== bookRef.section.name && { name: bookRef.page.name, path: bookRef.page.path },
        ].filter(x => !!x) })


        return h(theme.Article, { left, right }, [
          breadcrumbs,
          h(theme.Markdown, { root: article.content }),
          pagination
        ])
    }
  };

  return h('div', {},
    h(DocAppContext.Provider, { value: app },
      h(themeContext.Provider, { value: theme },
        h(theme.Page, {
          header: h(theme.Header, {}, app.page.topLevelNavLinks.map(({ name, path }) => {
            return h(BannerLink, { link: path }, name);
          })),
          footer: null
        }, renderPageContent())
  )))
}
