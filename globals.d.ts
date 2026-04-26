declare module "typedoc:*" {
  import { JSONOutput } from 'typedoc';

  const project: JSONOutput.ProjectReflection;

  export default project;
}

declare module "echo:*" {
  import { Echo } from '@lukekaalim/echo';

  const project: Echo;

  export default project;
}

