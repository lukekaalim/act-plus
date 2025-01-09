import assert from 'node:assert';
import { describe, it } from 'node:test';
import { lerp } from './math';

describe('math', () => {
  describe('lerp', () => {
    it('should find the midpoint of numbers if the progress is 0.5', () => {
      assert.strictEqual(lerp(0, 10, 0.5), 5);
      assert.strictEqual(lerp(0, 2, 0.5), 1);
      assert.strictEqual(lerp(10, 30, 0.5), 20);
    })
    it('should return the boundary numbers if progres is 1 or 0', () => {
      assert.strictEqual(lerp(0, 10, 0), 0);
      assert.strictEqual(lerp(0, 2, 1), 2);
      assert.strictEqual(lerp(10, 30, 1), 30);
    })
  })
})