import { writeFileSync } from "fs";
import { createEchoWatcher } from "./index.ts";

const main = (...filesToBuild: string[]) => {
  createEchoWatcher(filesToBuild.length > 0 ? filesToBuild : ["./index.ts"], async (path, module) => {

    writeFileSync(`./${module.name}.json`, JSON.stringify(module, null, 2), 'utf8');
  })
}


main(...process.argv.slice(2));