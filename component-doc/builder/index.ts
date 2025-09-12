import { DocPage } from "../DocPage";
import { PageStore } from "../stores";

export type DocBuilderState = {
  page: PageStore,
};

export class DocBuilder {
  state: DocBuilderState = {}

  constructor(state: DocBuilderState = {}) {
    this.state = state;
  }

  addPage(page: DocPage): DocBuilder {
    return new DocBuilder({ ...this.state, })
  }
}