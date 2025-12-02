import { AppAPI, AppSetup } from "./AppSetup";

export type DocPlugin = {
  register(app: AppSetup): void,

  augmentAPI(api: Partial<AppAPI>): void,
};

