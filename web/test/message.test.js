import { describe, it } from 'node:test';
import assert from 'node:assert';
import { tagline } from '../public/message.js';

describe('message', () => {
  it('tagline returns expected copy', () => {
    assert.strictEqual(tagline(), 'Client script loaded (module + dependency).');
  });
});
