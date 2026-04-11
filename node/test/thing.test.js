import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Comments } from '../src/index.js';

describe('Thing', () => {
  it('getComment returns rich reply object', () => {
    const comments = new Comments();

    const A = comments.addComment('AAA');
    const B = comments.addComment('BBB');
    const C = comments.addComment('CCC', A);

    assert.strictEqual(comments.getComment(A).replies[0].id, C);
  });

  it('getComment returns rich reply object and all children', () => {
    const comments = new Comments();

    const A = comments.addComment('AAA');
    const B = comments.addComment('BBB');
    const C = comments.addComment('CCC', A);
    const D = comments.addComment('DDD', B);
    const E = comments.addComment('EEE', C);
    const F = comments.addComment('FFF', C);

    assert.strictEqual(comments.getComment(A).replies[0].id, C);
    assert.strictEqual(comments.getComment(A).replies[0].replies[0].id, E);
    assert.strictEqual(comments.getComment(A).replies[0].replies[1].id, F);
  });

  it('deleteComment removes all children', () => {
    const comments = new Comments();

    const A = comments.addComment('AAA');
    const B = comments.addComment('BBB');
    const C = comments.addComment('CCC', A);
    const D = comments.addComment('DDD', B);
    const E = comments.addComment('EEE', C);
    const F = comments.addComment('FFF', C);

    comments.deleteComment(A);

    assert.strictEqual(comments.comments.size, 2);
    assert.strictEqual(comments.getComment(A), undefined);
    assert.strictEqual(comments.getComment(C), undefined);
    assert.strictEqual(comments.getComment(E), undefined);
    assert.strictEqual(comments.getComment(F), undefined);
  });

  it('deleteComment removes id from parents replies', () => {
    const comments = new Comments();

    const A = comments.addComment('AAA');
    const B = comments.addComment('BBB');
    const C = comments.addComment('CCC', A);

    comments.deleteComment(C);

    assert.deepEqual(comments.comments.get(A).replies, []);
  });
});
