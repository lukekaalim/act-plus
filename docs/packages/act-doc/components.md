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

The DocApp component is the primary entrypoint.

#### Usage:

```ts
const docs = [
  ...allFoundDocuments(),
  new Document('my-cool-manual-doc')
];
render(document.body, h(DocApp, { docs }));
````

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