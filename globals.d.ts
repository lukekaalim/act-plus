declare module "typedoc:*" {
  import { JSONOutput } from 'typedoc';

  const project: JSONOutput.ProjectReflection;

  export default project;
}

