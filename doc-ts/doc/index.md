# @lukekaalim/act-doc-ts

The Typescript support library for [@lukekaalim/act-doc](/packages/@lukekaalim/act-doc).

Provides
[typescript (using the official compiler api)](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
and
[tsdoc](https://github.com/microsoft/tsdoc/tree/main)
source file parsing, hyperlinking, analysis.

I think it's neat!

## Pipeline

![pipeline](/diagrams/doc-ts-workflow.png)

## API

### Registry
```ts
import { DocTsRegistry } from '@lukekaalim/act-doc-ts';
```

The "Registry" is the main entry point a regular user might interact with
act-doc-ts. You can use the registry to push code strings, add external
(and internal) links, and even read markdown to find code references.

The registry is seperated into "Namespaces" (and has a default one called
`global`), which can store `identifiers` - strings that uniquly identify
some analysed part of the code.

<DocTs namespace="@lukekaalim/act-doc-ts" identifier="DocTsRegistry" />

### Analysis

```ts
import { analyzeSourceFile } from '@lukekaalim/act-doc-ts';
```

Our analysis is fairly surface level, but we have a few functions
to tie some related data together. For a given
typescript source file, we can take a look at the AST structure
and try to find tsdoc comments, or identify top-level `const` or `type`
statements.

<DocTs namespace="@lukekaalim/act-doc-ts" identifier="analyzeSourceFile" />

AnalyzeSourceFile takes in a Typescript compiler SourceFile, which you can
create by passing your typescript code into `createSourceFile`.

If you are doing this, it is important you enable "parent nodes", aka
the fourth argument.

```ts
import ts from 'typescript';

const mySourceFile = await (import('./src.ts?raw').then(m => m.default));
ts.createSourceFile(`src.ts`, mySourceFile, ts.ScriptTarget.Latest, true);

```

<DocTs namespace="@lukekaalim/act-doc-ts" identifier="SourceFileAnalysis" />

<DocTs namespace="@lukekaalim/act-doc-ts" identifier="AnalysisFragment" />

<DocTs namespace="@lukekaalim/act-doc-ts" identifier="SupportedAnalysisTypescriptNode" />


<DocTs namespace="@lukekaalim/act-doc-ts" identifier="AnalysisReference" />