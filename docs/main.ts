import { Component, h, useRef, useState } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-web';


import {
  useRouter,
  useDOMIntegration,
  RouterPage,
  useRouterContext,
  RouterContext,
  createRelativeURLFactory,
  WebLink,
} from '@lukekaalim/act-router';
import { Grid3, Hero, MarkdownArticle, SidePanelContainer, TopBanner } from '@lukekaalim/act-doc';

import { documents } from "./markdown";
import { pages as pagesStore } from './pages';

import iconPlusURL from './media/icon-plus.png';
import { SVGRepo } from '@lukekaalim/act-icons';
import { storeContext, useStore } from '@lukekaalim/act-doc/contexts/stores';
import { tags } from './tags';
import { StoredArticle } from '@lukekaalim/act-doc/components/article/StoredArticle';
import { Article } from '@lukekaalim/act-doc/components/article/Article';
import { Content } from '@lukekaalim/act-doc/components/content/Content';
import { SideNav } from '@lukekaalim/act-doc/components/sidenav/SideNav';

const origin = createRelativeURLFactory();

const Nav = () => {
  return h('nav', {}, pages.map(page => {
    return h('li', { }, h('a', { href: page.path }, page.display))
  }));
}

const Home = () => {
  return [
    h(Nav),
    h('h1', {}, 'Home Page'),
    h('p', {}, [
      'This is the content of the home page. ',
      h('a', { href: '/about' }, 'This is a link to a different page')
    ]),
  ]
}
const About = () => {
  return [
    h(Nav),
    h('h1', {}, 'About Page'),
    h('p', {}, [
      'This lets you learn more about this project',
    ]),
  ]
}
const ListPage = () => {
  return [
    h(Nav),
    h('h1', {}, 'List Page'),
    h('ol', {}, [
      h('li', {}, h('a', { href: '#first' }, 'First')),
      h('li', {}, h('a', { href: '#second' }, 'Second')),
      h('li', {}, h('a', { href: '#third' }, 'Third')),
    ]),
    h('h2', { id: 'first' }, h('a', { href: '#first' }, 'First')),
    h('p', {}, Array.from({ length: 300 }).map(_ => `Some text! `).join('')),
    h('h2', { id: 'second' }, h('a', { href: '#second' }, 'Second')),
    h('p', {}, Array.from({ length: 300 }).map(_ => `Some text! `).join('')),
    h('h2', { id: 'third' }, h('a', { href: '#third' }, 'Third')),
    h('p', {}, Array.from({ length: 300 }).map(_ => `Some text! `).join('')),
  ]
}
const Search = () => {
  const router = useRouterContext();

  const [search, setSearch] = useState('');

  const resultQuery = router.location.searchParams.get('search') || '';

  const onInput = (event: InputEvent) => {
    setSearch((event.target as HTMLInputElement).value)
  };
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    router.navigate(origin.createURL('/search', { search }))
  }

  return [
    h(Nav),
    h('h1', {}, 'Search'),
    h('form', { onSubmit }, [
      h('input', {
        type: 'text',
        value: search, 
        onInput,
      })
    ]),
    h('p', {}, `Searched for: "${resultQuery}"`),
    h('ul', {}, pages.filter(page => page.path.includes(resultQuery)).map(page => {
      return h('li', {}, h('a', { href: page.path }, page.display))
    }) )
  ]
}

const IconTextBannerLogo = () => {
  return [
    h('img', {
      src: iconPlusURL,
      style: { 'border-radius': '8px', background: 'white', margin: '8px' }
    }),
    h('h1', { style: {
      'font-size': '18px',
      'white-space': 'pre',
      'margin': 'auto',
      'padding': '0 8px',
      color: 'white'
    } }, '@lukekaalim/act-plus')
  ]
}
const BannerLink: Component = ({ children }) => {
  return h('span', { style: {
      'display': 'flex',
      'font-size': '18px',
      'white-space': 'pre',
      'margin': 'auto',
      'padding': '0 8px',
      color: 'white'
    } }, children)
}

const banner = h(TopBanner, {
  logoLink: {
    location: origin.createURL('/'),
    display: h(IconTextBannerLogo),
  },
  topLevelLinks: [
    {
      location: origin.createURL('/about'),
      display: h(BannerLink, {}, 'About')
    },
    {
      location: origin.createURL('/demo', {}, 'packages'),
      display: h(BannerLink, {}, 'Packages')
    },
    {
      location: origin.createURL('/changelog'),
      display: h(BannerLink, {}, 'Changelog')
    },
    {
      location: origin.createURL('/blog'),
      display: h(BannerLink, {}, 'Blog')
    },
    {
      location: new URL(`https://github.com/lukekaalim/act-compdoc`),
      display: h(BannerLink, {}, [
        h(SVGRepo, { key: `512317/github-142`, style: { filter: `invert(1)` } }),
        ' Github'
      ])
    },
  ],
  endContext: h('span', { style: {
    border: '2px solid white',
    'border-radius': '8px',
    background: 'white',
    cursor: 'pointer',
    color: 'black',
    padding: '8px',
    'white-space': 'nowrap',
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    margin: '8px'
  } }, ["v1.0.0-beta 0", h(SVGRepo, { key: `500841/dropdown`, style: { 'margin-left': '4px' } })])
});

const DemoPage = () => {
  const style = {

  };
  return h('div', { style }, [
    h(Hero, {
      backgroundContent: h('img', {
        src: iconPlusURL,
      }),
      blurbContent: [
        h(WebLink, {
          style: { color: 'rgb(57, 120, 238)', 'text-decoration-color': 'rgb(57, 120, 238)' },
          link: { display: h('h2', {}, '@lukekaalim/act-plus'),
            location: new URL('https://github.com/lukekaalim/act-compdoc')
          }
        }),
        h('p', {},
          'This project is a combination of useful packages in the @lukekaalim/act ecosystem.'
        ),
        h('p', {},
          'Including component libraries for documentation, routing, icons, graphs, animations, and more!'
        ),
      ]
    }),
    h('h2', {
      style: { width: '1000px', margin: '24px auto', 'text-align': 'center' },
      id: 'packages',
    }, 'Packages'),
    h(Grid3, {
      cards: [
        {
          id: 'doc',
          destination: origin.createURL('/packages/@lukekaalim/act-doc'),
          content: [
            h('h3', {}, '@lukekaalim/act-doc'),
            h('p', {}, 'A component library for building developer documentation websites in act!'),
          ]
        },
        {
          id: 'tsdoc',
          destination: origin.createURL('/packages/@lukekaalim/act-tsdoc'),
          content: [
            h('h3', {}, '@lukekaalim/act-tsdoc'),
            h('p', {}, 'Components for building typescript docs using the Typescript Compiler API, and the tsdoc tool'),
          ],
        },
        {
          id: 'httpdoc',
          destination: origin.createURL('/packages/@lukekaalim/act-httpdoc'),
          content: [
            h('h3', {}, '@lukekaalim/act-httpdoc'),
            h('p', {}, 'Components for building openapi/swagger, blueprint, JsonSchema (or other HTTP API specification tools)'),
          ],
        },
        {
          id: 'graphit',
          destination: origin.createURL('/packages/@lukekaalim/act-graphit'),
          content: [
            h('h3', {}, '@lukekaalim/act-graphit'),
            h('p', {}, 'Components for drawing SVGs, and controls for editing them dynamically'),
          ],
        },
        {
          id: 'curve',
          destination: origin.createURL('/packages/@lukekaalim/act-curve'),
          content: [
            h('h3', {}, '@lukekaalim/act-curve'),
            h('p', {}, 'Animation Library for act, from 1 to 3 dimensions. Keyframes, bezier curves, render loops.'),
          ],
        },
        {
          id: 'markdown',
          destination: origin.createURL('/packages/@lukekaalim/act-markdown'),
          content: [
            h('h3', {}, '@lukekaalim/act-markdown'),
            h('p', {}, 'Markdown rendering library - uses the mdast AST to generate lovley markdown. Support for various plugins, as well as MDX!'),
          ],
        },
        {
          id: 'router',
          destination: origin.createURL('/packages/@lukekaalim/act-router'),
          content: [
            h('h3', {}, '@lukekaalim/act-router'),
            h('p', {}, 'Page/Link library for handling SPAs neatly.'),
          ],
        },
        {
          id: 'icons',
          destination: origin.createURL('/packages/@lukekaalim/act-icons'),
          content: [
            h('h3', {}, '@lukekaalim/act-icons'),
            h('p', {}, 'Simple Icon library that intergrates with a few Icon APIs to provide images based on icon IDs'),
          ],
        },
      ]
    }),

    h(SidePanelContainer, {
      scrollWindowRef: { current: document.body },
      left: h(SideNav, {}, [
        h(SideNav.List, {}, [
          h(SideNav.List.Anchor, { href: './' }, 'Main'),
          h(SideNav.List.Anchor, { href: './components' }, 'Components'),
          h(SideNav.List.Anchor, { href: './components' }, 'Components'),
        ])
      ]),
      right: 'rofl'
    }, h('div', { style: { height: '5000px', margin: '0 auto', width: '800px' }}, h(MarkdownArticle, { content: `# Yoooo` })))
    
  ])
}

const blogs = [
  import('./blogs/0.md?raw'),
  import('./blogs/1.md?raw'),
]

const BlogPage = () => {
  const { document } = useStore();
  return h('div', {}, [
    h('div', {}, [
      document.getByTag('blog', tags).map(blog =>
        h(Article, { meta: blog.meta, hiddenTagKeys: ['blog'] }, blog.content)),
    ])
  ]);
}

const pages = RouterPage.map({
  '/': { component: DemoPage },
  '/about': { component: About },
  '/list': { component: ListPage },
  '/demo': { component: DemoPage },
  '/blog': { component: BlogPage },
  '/search': { component: Search }
})
pages.push(...pagesStore.pages);

const ExampleApp = () => {
  const ref = useRef<HTMLElement | null>(null);
  const router = useRouter({
    initialLocation: new URL(document.location.href),
    pages,
  });
  useDOMIntegration(router);

  return h(RouterContext.Provider, { value: router },
    h(storeContext.Provider, { value: { tags, page: pagesStore, document: documents } },
      [
        banner,
        h(router.page.component, { onReady() { console.log('Page ready'); }, })
      ]
    )
  );
};

const main = () => {
  const style = {
    height: '100%',
    display: 'flex',
    'flex-direction': 'column',
  };
  render(h('div', { style }, h(ExampleApp)), document.body);
};

main();