import Color, { ColorLike } from 'color';
import hash from '@sindresorhus/string-hash';

export type TagID = string;
export type Tag = {
  key: TagID,
  display: string,
  color: ColorLike,

  alias: string[],
};

/**
 * Create a new Tag
 * @param name 
 * @returns 
 */
export function Tag(key: string, {
  display = key,
  color,
  alias = []
}: Partial<Omit<Tag, "id">> = {}): Tag {
  const lowerKey = key.toLocaleLowerCase();
  return {
    key: lowerKey,
    color: color || new Color(`hsl(${hash(lowerKey) % 360}deg, 100%, 30%)`),
    display,
    alias
  };
}

Tag.match = (tag: Tag, key: string) => {
  const lowerKey = key.toLocaleLowerCase();
  return tag.key === lowerKey || tag.alias.includes(lowerKey);
}