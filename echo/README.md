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

<EchoModule module="@lukekaalim/echo" heading="API">

> 🤖 Generated using Echo!

</EchoModule>