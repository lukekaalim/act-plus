import { NavigationController } from "./NavigationController"
import { Component, h } from "@lukekaalim/act"
import classes from './NavigationPanel.module.css';
import { DocPage } from "./DocPage";
import { SVGRepo } from "@lukekaalim/act-icons";


export type NavigationPanelProps = {
  navigation: NavigationController,
  pages: DocPage[]
}

export const NavigationPanel: Component<NavigationPanelProps> = ({ pages, navigation }) => {
  return h('nav', { className: classes.navigationPanel }, [
    h(NavigationEntry, { navigation, pages, path: '/' }),
    h(NavigationList, { path: '/', pages, navigation })
  ])
}

type NavigationListProps = {
  navigation: NavigationController,
  path: string,
  pages: DocPage[],
  depth?: number,
}

const NavigationList: Component<NavigationListProps> = ({ path, pages, navigation, depth = 0, }) => {
  const allPaths = [...new Set(pages.flatMap(page => {
    const segments = page.path.split('/');
    return segments.map((_, i) => segments.slice(0, i + 1).join('/'))
  }))]

  const directDescendants = allPaths.filter(possiblePath => {
    if (!possiblePath.startsWith(path))
      return false;
    
    return possiblePath.split('/').filter(Boolean).length  === (path.split('/').filter(Boolean).length + 1);
  });
  if (directDescendants.length < 1)
    return null;
  
  return h('ol', {
    className: classes.navigationList,
    style: { marginLeft: `${depth}em`}
  }, directDescendants.map(path => {
    return h('li', {}, [
      h(NavigationEntry, { navigation, pages, path }),
      h(NavigationList, { path, pages, navigation, depth: depth + 1 })
    ])
  }));
}

type NavigationEntryProps = {
  navigation: NavigationController,
  pages: DocPage[],
  path: string
}
const NavigationEntry: Component<NavigationEntryProps> = ({ navigation, path, pages }) => {
  const page = pages.find(page => page.path === path);
  const segments = path.split('/');
  const segmentName = segments[segments.length - 1];
  const segmentDisplay = [
    segments.length > 0 ? h(SVGRepo, { key: "437819/corner-down-right" }) : null,
    '/' + segmentName
  ]

  if (!page) {;
    return h('span', {}, segmentDisplay)
  }

  const selected = navigation.location.pathname === page.path;

  return h('a', {
    href: page.path,
    className: [classes.navigationLink, selected && classes.selected].join(' '),
  }, page.link || segmentDisplay)
}