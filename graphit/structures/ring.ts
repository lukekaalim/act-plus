/**
 * Simple data structure that stores T
 * in ring slots.
 * 
 * @example
 * ```ts
 * import { Ring } from '@lukekaalim/act-graphit';
 * const my_ring = new Ring<string>(2);
 * 
 * my_ring.push("Hello");
 * my_ring.push("World");
 * 
 * // after this push, "Hello" is dropped
 * my_ring.push("Star");
 * 
 * // prints "World", "Star"
 * console.log(Array.from(my_ring.values()))
 * ```
 */
export class Ring<T> {
  /** @private */
  readonly backend: T[];

  /** @private */
  index: number;
  /** @private */
  size: number;

  /**
   * 
   * @param capacity The maximum amount of items that can be
   * inside the Ring at once. Once items are pushed beyond
   * the capacity, the oldest one is removed.
   */
  constructor(capacity: number) {
    this.backend = Array.from({ length: capacity });
    this.index = 0;
    this.size = 0;
  }

  push(item: T) {
    this.backend[this.index] = item;
    this.index = (this.index + 1) % this.backend.length;

    if (this.size < this.backend.length)
      this.size++;
  }

  *map<Output>(transformer: (item: T) => Output): Generator<Output, null, Output> {
    const { index, size, backend: { length: capacity }} = this;
    const startIndex = (index + capacity - size) % capacity;

    for (let i  = 0; i < this.size; i++) {
      yield transformer(this.backend[(startIndex + i) % this.backend.length])
    }
    return null;
  }
  values() {
    return this.map(x => x);
  }
}