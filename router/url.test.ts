import assert from "node:assert";
import { describe, it, test } from "node:test";
import { isURLEqual } from "./url";

describe('isURLEqual', () => {
  test('when two urls are the same', () => {
    const first = new URL('https://www.example.com:443/a-cool-path?param=true#random_hash')
    const second = new URL('https://www.example.com:443/a-cool-path?param=true#random_hash')

    assert(isURLEqual(first, second));
  })

  test('when two URLs have different params', () => {
    const first = new URL('https://www.example.com?param=true')
    const second = new URL('https://www.example.com?param=false')

    assert(!isURLEqual(first, second));
  })
  test('when two URLs have different paths', () => {
    const first = new URL('https://www.example.com/left')
    const second = new URL('https://www.example.com/right')

    assert(!isURLEqual(first, second));
  })
  test('when two URLs have different hashes', () => {
    const first = new URL('https://www.example.com#hash-a')
    const second = new URL('https://www.example.com#hash-b')

    assert(!isURLEqual(first, second));
  })
  test('when two URLs have different origins', () => {
    const first = new URL('https://www.example.com')
    const second = new URL('http://www.example.com')

    assert(!isURLEqual(first, second));
  })
})