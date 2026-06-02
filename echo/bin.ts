#!/bin/env -S tsx --trace-deprecation

import { writeFileSync } from "fs";
import { createEchoWatcher } from "./watcher";

const main = (...filesToBuild: string[]) => {
  if (filesToBuild.length < 1) {
    console.log(`Enter filenames to build`);
    return;
  }

  createEchoWatcher(filesToBuild.length > 0 ? filesToBuild : ["./index.ts"], async (path, module) => {
    writeFileSync(`./${module.moduleName}.json`, JSON.stringify(module, null, 2), 'utf8');
  })
}


main(...process.argv.slice(2));