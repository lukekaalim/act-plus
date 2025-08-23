import { Component, h } from '@lukekaalim/act';
import classes from './MarkdownArticle.module.css';

export const CodeBox: Component = ({ children }) => {
  return h('code', { className: classes.mkCode }, children)
}