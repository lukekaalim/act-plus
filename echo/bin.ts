import { writeFileSync } from "fs";
import { createEchoWatcher } from "./index.ts";

const main = () => {
  createEchoWatcher(["./index.ts"], async (path, module) => {

    writeFileSync('./mod.json', JSON.stringify(module, null, 2), 'utf8');
  })
}


main();