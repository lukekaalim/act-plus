<Center>![Echo](/icons/echo_title.png)</Center>

# @lukekaalim/echo

Simple type reflection library using the typescript compiler API.

```bash
npm i @lukekaalim/act
```

## Features

> 🚧 **Currently not feature complete!** 🚧

Echo reads out a typescript module into a set of serializable
declarations, with type information for each export.

It provides both the declared type structure, as well as the
resolved underlying symbols/structures.

It also find relevant [TSDoc](https://tsdoc.org/) comments,
and provides the relevant information about their references.

**Supported Declarations:**
  - [x] Type Aliases
    - [x] Type Parameters
      - [x] `extends`
      - [x] `default`
  - [x] Functions
    - [x] Parameters
      - [x] Optional
      - [ ] Destructured
      - [ ] Rest
      - [ ] Spread
    - [x] Return
    - [x] Type Parameters
  - [ ] Classes
  - [ ] Interfaces
  - [ ] Enums
  - [ ] Namespaces
    - [x] Merging (I kind of want to represent namespaces as a separate entity)

**Supported Types:**
  - [x] Literal
    - [x] Strings
    - [x] Numbers
    - [x] Booleans
    - [x] Null
  - [x] Objects
  - [x] References
    - [x] Identifiers
    - [x] Type Parameters
    - [ ] Underlying Type
    - [ ] Externals
  - [x] Functions
  - [ ] Classes
  - [ ] Interfaces
  - [ ] Enums

## Usage

### As a executable

```bash
npm i -g @lukekaalim/echo;

ts-echo ./index.ts --out types.json
```

### As a library

```ts
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

### Internals

This library is basically a simple wrapper around the typescript
compiler API, which does the bulk of type and AST analysis/checking.

Based off some entrypoint ts file that we feed to the compiler, we
iterate through all the statements, looking the TypeAliases, VariableStatements,
Functions, Interfaces, Classes, Namespace and Export statements. If they have
the appropriate export keywords, they get added to the "List of Internal Declarations".
If our statement links to another module (i.e. via `export * from './submodule'`), 
then we follow the import and repeat the processes until we have all the exports
for the entrypoint.

We keep track of different typescript "Symbols" that we see, in case we come across
one that we've seen before. We then run our type-builder across type underlying
types of the declaration statements, building out the type representation.

If we get to a type reference for another type, we first check if its an internal
declaration (which is easy). If not, we tale a look at where this type is really
defined, and try to guess which package it probably belongs to.

We _also_ then take a peek through all the exports of _that_ package, collecting
their identifiers and symbols. If the symbol we are looking at is in the exports,
great! Otherwise, its a type declared outside of the exports in a random file,
so we just print the filename and identifier and wash our hands of it.

That's about all the dependency type analysis that happens - we expect the
consumers of this data to match up the external references themselves, either
using the DocApp reference system if they are building a Grimoire app, or by
some other system (or just ignoring them and not linking to 3rd party documentation).

<EchoModule module="@lukekaalim/echo" heading="API">

> 🤖 Generated using Echo!

</EchoModule>