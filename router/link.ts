import { Component, Node } from '@lukekaalim/act';

/**
 * A link is a helpful container for
 * describing a destination _and_
 * a way to render that destination.
 * 
 * Some other component should consume a link
 * object, and create a platform
 * specific implementation of it to handle the act
 * of navigation itself.
 * 
 * (i.e. dont include an anchor in the `display`
 * node - someone else should make that)
 */
export type Link = {
  display: Node,
  location: URL,
};
