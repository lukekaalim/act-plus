<Center>![Echo](/icons/echo_title.png)</Center>

# @lukekaalim/echo

Simple type reflection library using the typescript compiler API.

```bash
npm i @lukekaalim/act
```

## Features

Echo reads out a typescript module into a set of serializable
declarations, with type information for each export.

It provides both the declared type structure, as well as the
resolved underlying symbols/structures.

It also find relevant [TSDoc](https://tsdoc.org/) comments,
and provides the relevant information about their references.

  - [x] TypeAlias Declarations
  - [x] Functions/ArrowFunction Declarations
  - [x] const/var/let Values
  - [x] TSDoc Comments

## Usage

The output of each of these is an [Echo Module](#echo:@lukekaalim/echo:EchoModule)

### As a executable

```bash
npm i -g @lukekaalim/echo;

ts-echo ./index.ts --out types.json
```

### As a library

```ts
import *  as ts from 'typescript';
import {
  createModuleBuilder,
  createModuleWatcher
} from '@lukekaalim/act';

// either with my own typescript compiler
const myProject = ts.compileProgram('./index.ts')
const myReflection = createModuleBuilder(myProject);

// or using the typescript listener
const watcher = createModuleWatcher({
  onResult(myReflection) {
    console.log(myReflection;)
  }
})

```

### As a plugin

```ts
import myReflection from "echo:./index.ts";

console.log(myReflection.exports);

```

## Details

This library is basically a simple wrapper around the typescript
compiler API, which does the bulk of type and AST analysis/checking.

It visits the exports of a particular module, and then traverses
the types for each of them. For cases where explicit types aren't declared,
we use typescript to infer the type.

We try to match up references to types that were exported in this module,
as well as exports/types defined in other modules (called "Externals"). This can
include third-party types references in your exports, or just references to undeclared
types.

## API

### Core

<Echo module="@lukekaalim/echo" name="Echo" />