import { Component, h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act"
import { useDocApp } from "../../application"
import { buildNavTreeFromDOM, createNavTreeBuilder, NavTree2 } from "../../lib"
import { SidePanelContainer } from "../sidenav"
import { VerticalNavMenu2 } from "../vertical_nav_menu"

export type FullSizePageProps = {
  navTree?: NavTree2
}

export const FullSizePage: Component<FullSizePageProps> = ({ children, navTree }) => {
  const doc = useDocApp([]);

  const routeTree = useMemo(() => navTree || doc.route.getNavTree(), [navTree])

  return h('div', { style: { position: 'relative', display: 'flex', flex: 1, 'flex-direction': 'column', height: '100%' } }, [
    h('div', { style: { position: 'absolute', left: '2em', top: '2em' } },
      h(VerticalNavMenu2, { tree: routeTree })),
    children,
  ]);
}