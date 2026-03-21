import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Thing } from '../src/Thing.js';

describe('Thing', () => {
  it('defaults world to "world" and hello() uses it', () => {
    const thing = new Thing();
    assert.strictEqual(thing.world, 'world');
    assert.strictEqual(thing.hello(), 'hello world');
  });

  it('accepts a custom suffix for world and hello()', () => {
    const thing = new Thing('there');
    assert.strictEqual(thing.world, 'there');
    assert.strictEqual(thing.hello(), 'hello there');
  });
});
