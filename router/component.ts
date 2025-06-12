import { Component } from '@lukekaalim/act';

export type RouterPageProps = {
  onReady: () => void,
};

export type RouterPageComponent = Component<RouterPageProps>;
