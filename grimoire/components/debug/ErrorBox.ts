import { Component, h } from '@lukekaalim/act';
import classes from './classes.module.css';

export type InlineErrorBoxProps = {
  severity?: 'error' | 'warning' | 'info' | 'debug'
}

export const InlineErrorBox: Component<InlineErrorBoxProps> = ({ children, severity = 'error' }) => {
  return h('div', { classList: [classes.inlineErrorBox, classes[severity]] },
    children);
};
