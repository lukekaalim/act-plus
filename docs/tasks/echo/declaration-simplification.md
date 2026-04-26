---
id: echo-5
status: in-progress
---
### Declaration Simplification

Echo has an array of types for different kinds of declarations:
classes, interfaces, type aliases, functions, variables.

Along with that, it has a representation of a type system to
capture the meaning of elements of these declarations.

There is a lot of overlap between declarations and types, we
should reduce it. There really should only be "type" and
"value" declarations, as the two discrete qualities of
exported identifiers.

We should make it easy to understand the contents of a declaration via
its type with utility functions.

Remove:
  - [x] Class Declarations
  - [x] Interface Declarations
  - [x] Type Alias Declarations
  - [x] Function Declarations

(So that only "Variable Declaration" exists)

Add:
  - [x] New concept: Identifier. A named "thing" Comes in a few flavors:
    - [x] TypeIdentifier. Something that exists in TypeSpace. Can have generic arguments.
    - [x] ValueIdentifier. A literal value, that has a type.
    - [x] ExternalIdentifier. A thing from somewhere else, not documented here.
      It's name and filesource are recorded
    - [x] GenericIdentifier. A parameter from a TypeAlias, Class, Interface, or Function.
  - [x] More support for classes/interfaces/functions as types
  - [ ] Comments attached to types/type + member instead of declaration
  - [ ] Error/Diagnostic Support for result structure.