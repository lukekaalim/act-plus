declare module "typedoc:*" {
  import { JSONOutput } from 'typedoc';

  const project: JSONOutput.ProjectReflection;

  export default project;
}

declare module "echo:*" {
  import { EchoModule } from '@lukekaalim/act';

  const project: EchoModule;

  export default project;
}

