import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { safePublicPath } from '../lib/safe-public-path.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const fixtureRoot = resolve(__dirname, 'fixtures', 'public');

describe('safePublicPath', () => {
  it('maps / to index.html under public root', () => {
    const got = safePublicPath('/', fixtureRoot);
    assert.strictEqual(got, resolve(fixtureRoot, 'index.html'));
  });

  it('strips query string before resolving', () => {
    const got = safePublicPath('/app.js?v=1', fixtureRoot);
    assert.strictEqual(got, resolve(fixtureRoot, 'app.js'));
  });

  it('returns null for path traversal outside public root', () => {
    assert.strictEqual(safePublicPath('/../secret.txt', fixtureRoot), null);
  });

  it('returns null on invalid percent-encoding', () => {
    assert.strictEqual(safePublicPath('/%ZZ', fixtureRoot), null);
  });
});
