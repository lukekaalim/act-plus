import { createContext, createId, Node, OpaqueID, useState } from "@lukekaalim/act";
import { DocPage } from "./DocPage";

export type DocHeading = {
  id: string,
  parentId?: string,
  text: Node
}

export type DocPageState = {
  id: OpaqueID<"PageID">,
  template: DocPage,
  status: 'loading' | 'ready',
  headings: DocHeading[]
}

export type DocPageController = {
  startLoading(): void,
  finishLoading(): void,

  submitHeadings: (headings: DocHeading[]) => void,
};

export const docControllerContext = createContext<null | DocPageController>(null);

export const useRootDocController = () => {
  const [status, setStatus] = useState<'loading' | 'ready'>('ready');
  const [headings, setHeadings] = useState<DocHeading[]>([]);

  const controller: DocPageController = {
    startLoading() {
      setStatus('loading')
    },
    finishLoading() {
      setStatus('ready')
    },
    submitHeadings: setHeadings,
  }

  return [controller, { status, headings }];
};
