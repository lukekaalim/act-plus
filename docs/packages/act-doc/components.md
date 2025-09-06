---
title: act-doc-components
---

# Components

This library exports a few components

## Framework

These components represent the main entrypoint into the "managed"
components API.

Framework components take in high-level props descibing an entire
system or set of components, and renders out all the UI needed to descibe
it.

### DocumentationApp

<DocTs namespace="@lukekaalim/act-doc" identifier="DocumentationApp" />

The `DocumentationApp` component is the primary entrypoint. It's a "Full Page" component
that takes up as much space as possible, and contains the navigation system,
documentation loading system and other top-level concerns.

To use this, you can embed this into your own component, or just choose to render
this at the highest level.

> If you want more customisation than what the DocApp can provide, take a look
> at the individual components!

#### Props

<DocTs namespace="@lukekaalim/act-doc" identifier="DocumentationAppProps" />

#### Usage

```typescript
const docs = [
  ...allFoundDocuments(),
  new Document('my-cool-manual-doc')
];
render(document.body, h(DocApp, { docs }));
```

#### Preview

## Structural

Structural components are the alternative to using the DocumentationApp -
these are the raw building blocks for creating navigation elements,
side panels, top bars and everything else to move about a documentation site.

### TopBar

### SideNav

### Footer

## Content

_"Content"_ is a category of components from Doc that is meant
to capture elements that describe _specific technical_ elements
of documentation, from interactive demos, syntax-highlighted
code blocks, markdown renderers and all in-between.

Regardless if you are using the Framework entrypoint or assembling
components togther manually, you will always need to use a Content component
to describe something.

### Article

<DocTs namespace="@lukekaalim/act-doc" identifier="Article" />
<DocTs namespace="@lukekaalim/act-doc" identifier="ArticleProps" />

### CodeBox

<DocTs namespace="@lukekaalim/act-doc" identifier="CodeBox" />
<DocTs namespace="@lukekaalim/act-doc" identifier="CodeBoxProps" />

### CardGrid

### Demo

### Tags
