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

### DocApp

<CompDoc version="1" />

The DocApp component is the primary entrypoint. It's a "Full Page" component
that takes up as much space as possible, and contains the navigation system,
documentation loading system and other top-level concerns.

To use this, you can embed this into your own component, or just choose to render
this at the highest level.

> If you want more customisation than what the DocApp can provide, take a look
> at the individual components!

#### Props

<PropDoc component="DocApp" />

#### Usage

```ts
const docs = [
  ...allFoundDocuments(),
  new Document('my-cool-manual-doc')
];
render(document.body, h(DocApp, { docs }));
```

#### Preview

## Structural

### TopBar

### SideNav

### Footer

## Content

### Article

### CardGrid

### Demo

## Hero

## Tags

### TagPill

### TagRow