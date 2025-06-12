import { Component } from "@lukekaalim/act";
import { DocPage } from "./DocPage";

/**
 * Create an array of Doc Pages from a 
 * object where the keys are the path, and the value
 * is the component.
 * @param pageMap 
 */
export const createSimplePages = (pageMap: Record<string, Component>): DocPage[] => {

}

/**
 * 
 * @param pageMap 
 */
export const createModulePages = (
  pageMap: Record<string, () => Promise<{ default: Component }>>
): DocPage[] => {

}