import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Comments } from '../src/index.js';

describe('Thing', () => {
  it('can add comment', () => {
    const comments = new Comments();

    const A = comments.addComment('AAA');

    const { id, ...Aobject } = comments.comments.get(A)
    assert.deepEqual(Aobject, {
        parentId: undefined,
        replies: [],
        text: 'AAA'
    });
  });

  it('can get comment', () => {
    const comments = new Comments();

    const A = comments.addComment('AAA');

    const { id, ...Aobject } = comments.getComment(A);

    assert.deepEqual(Aobject, {
        parentId: undefined,
        replies: [],
        text: 'AAA'
    });
  });


  it('can add comment with parent', () => {
    const comments = new Comments();


    const A = comments.addComment('AAA');
    const B = comments.addComment('BBB', A);

    const {id, ...Aobject} = comments.comments.get(A)

    assert.deepEqual(Aobject, {
      parentId: undefined,
      replies: [B],
      text: 'AAA'
    });
  });

  it('can get comment with replies - returns rich comment', () => {
    const comments = new Comments();


    const A = comments.addComment('AAA');
    const B = comments.addComment('BBB', A);

    const Acomment = comments.getComment(A);
    const Bcomment = comments.getComment(B);

    assert.strictEqual(Acomment.replies[0].id, B);
    assert.strictEqual(Bcomment.parentId, A);
  });

  it('can delete comment with replies - also removes children', () => {
    const comments = new Comments();

    const A = comments.addComment('AAA');
    const B = comments.addComment('BBB', A);

    comments.deleteComment(A);
    const Acomment = comments.getComment(A);
    const Bcomment = comments.getComment(B);

    assert.strictEqual(Acomment, undefined);
    assert.strictEqual(Bcomment, undefined);
  });

  it('can delete comment with replies - also removes self from parent replies', () => {
    const comments = new Comments();

    const A = comments.addComment('AAA');
    const B = comments.addComment('BBB', A);

    comments.deleteComment(B);
    const Acomment = comments.getComment(A);
    const Bcomment = comments.getComment(B);

    assert.deepEqual(Acomment.replies, []);
    assert.strictEqual(Bcomment, undefined);
  });

});
