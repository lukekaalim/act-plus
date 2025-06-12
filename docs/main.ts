import { h, useRef, useState } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-web';

import {
  useRouter,
  useDOMIntergration,
  RouterLocation,
  RouterPage,
  useRouterContext,
  RouterContext,
} from '@lukekaalim/act-router';

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

  const resultQuery = router.location.query.search || '';

  const onInput = (event: InputEvent) => {
    setSearch((event.target as HTMLInputElement).value)
  };
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    router.navigate({
      path: '/search',
      query: { search },
      hash: ''
    })
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

const pages = RouterPage.map({
  '/': { display: 'home', component: Home },
  '/about': { component: About },
  '/list': { component: ListPage },
  '/search': { component: Search }
})

const ExampleApp = () => {
  const ref = useRef<HTMLElement | null>(null);
  const router = useRouter({
    initialLocation: RouterLocation.fromURL(new URL(document.location.href)),
    pages,
  });
  useDOMIntergration(router);

  return h(RouterContext.Provider, { value: router },
    h('div', { ref, style: {
      width: '800px',
      margin: 'auto',
      background: '#eaeaea',
      padding: '24px'
    } },
      h(router.page.component, { onReady() { console.log('Page ready'); }, })
    )
  )
};

const main = () => {
  render(h('div', {}, h(ExampleApp)), document.body);
};

main();