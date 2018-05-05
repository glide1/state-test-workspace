#!/usr/bin/env node

import * as program from 'commander';
import * as glob from 'glob';
import * as path from 'path';
import { runTests } from "./index";

function collect(val: string, store: string[]) {
  store.push(val)
}

const reqs: string[] = []

program.version('0.0.1')
  .arguments(`[options] <files>`)
  .option('-r --require <items>', 'requires a module', collect, reqs)
  .parse(process.argv);

console.log('requires', reqs)

for (const req of reqs) {
  require(req)
}

console.log('all args', process.argv)

const loadTests = () => {
  for (const arg of process.argv.slice(2)) {
    const matches = glob.sync(arg)
    for (const file of matches) {
      console.log('addings tests from file: ', file)
      require(path.resolve(file))
    }
  }
}
loadTests()
runTests()
