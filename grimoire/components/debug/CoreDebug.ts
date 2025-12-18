import { h } from "@lukekaalim/act";
import { useDocApp } from "../../application";

export const CoreDebug = () => {
  const doc = useDocApp([]);

  return [
    h('h3', {}, 'Direct References'),
    h('table', {}, doc.reference.references.map(reference => h('tr', {}, [
      h('td', {}, reference.key),
      h('td', {}, reference.location.path),
      !!reference.location.fragment && [
        h('span', {}, '#'),
        h('span', {}, reference.location.fragment)
      ]
    ]))),
    h('h3', {}, 'Indirect References'),
    h('table', {}, doc.reference.indirect_references.map(reference => h('tr', {}, [
      h('td', {}, reference.source),
      h('td', {}, reference.destination),
      !!reference.fragment && [
        h('td', {}, reference.fragment)
      ]
    ]))),
    h('h3', {}, 'Routes'),
    h('table', {}, doc.route.routes.map(route => h('tr', {}, [
      h('td', {}, route.path),
    ]))),
  ]
};