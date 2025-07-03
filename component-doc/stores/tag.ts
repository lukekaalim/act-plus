import { ColorInstance } from "color";
import { Tag } from "../lib/tag";

/**
 * A TagStore is a 
 */
export type TagStore = {
  add(tag: Tag, ...tags: Tag[]): TagStore,

  get(key: string): Tag | null,

  tags: Tag[]
};

export const createTagStore = (tags: Tag[] = []): TagStore => {
  const store: TagStore = {
    add(...newTags) {
      tags.push(...newTags);
      return store;
    },
    get(key) {
      const lowerKey = key.toLocaleLowerCase();
      return tags.find(tag => tag.key === lowerKey || tag.alias.includes(lowerKey)) || null;
    },
    tags,
  }

  return store;
}
