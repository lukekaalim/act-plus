import { Component } from "@lukekaalim/act";

export type DemoSubject = Component;

export type DemoStore = {
  subjects: Map<string, DemoSubject>,
}

export const createDemoStore = (): DemoStore => {
  return {
    subjects: new Map(),
  }
};

export const DemoStore = {
  create: createDemoStore,
  global: createDemoStore(),
};
