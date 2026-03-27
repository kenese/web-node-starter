import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Comments } from '../src/Comment.js';

describe('Thing', () => {
  it('adds comment to map returns id', () => {
    const comments = new Comments();
    const id = comments.addComment('Hello World');
    assert.strictEqual(comments.comments.get(id).text, 'Hello World');
    assert.strictEqual(comments.comments.get(id).replies.length, 0);
    assert.strictEqual(
      comments.comments.get(id).parentId,
      comments.rootCommentId
    );
  });

  it('adds comment to specific parent', () => {
    const comments = new Comments();
    const parentId = comments.addComment('Hello World');
    const newId = comments.addComment('Hello World', parentId);

    assert.strictEqual(comments.comments.get(newId).parentId, parentId);
    assert.strictEqual(comments.comments.get(parentId).replies.length, 1);
    assert.strictEqual(comments.comments.get(parentId).replies[0], newId);
  });

  it('get specific comment also returns replies', () => {
    const comments = new Comments();
    const parentId = comments.addComment('Parent');
    const newId = comments.addComment('Child', parentId);

    const parentComment = comments.getComment(parentId);

    assert.strictEqual(parentComment.replies.length, 1);
    assert.strictEqual(parentComment.replies[0].id, newId);
    assert.strictEqual(
      comments.getComment(parentId).replies[0].parentId,
      parentId
    );
  });

  it('get root comment returns all comments and replies', () => {
    const comments = new Comments();

    const newRootLevel1 = comments.addComment('root 1');
    const newRootLevel2 = comments.addComment('root 2');
    const newRootLevel3 = comments.addComment('root 3');
    const child1 = comments.addComment('child1', newRootLevel1);
    const child2 = comments.addComment('child2', child1);

    assert.strictEqual(comments.getComment(newRootLevel1).replies.length, 1);
    assert.strictEqual(
      comments.getComment(newRootLevel1).replies[0].id,
      child1
    );
    assert.strictEqual(
      comments.getComment(newRootLevel1).replies[0].replies[0].id,
      child2
    );

    assert.strictEqual(comments.getComment().replies.length, 3);
    assert.strictEqual(comments.getComment().replies[0].id, newRootLevel1);
    assert.strictEqual(comments.getComment().replies[1].id, newRootLevel2);
    assert.strictEqual(comments.getComment().replies[2].id, newRootLevel3);
  });

  it('delete comment also deletes all that comments replies', () => {
    const comments = new Comments();

    const newRootLevel1 = comments.addComment('root 1');
    const child1 = comments.addComment('child1', newRootLevel1);
    const child2 = comments.addComment('child2', child1);

    comments.deleteComment(child1);

    assert.strictEqual(comments.getComment(newRootLevel1).replies.length, 0);
    assert.strictEqual(comments.getComment(child2), undefined);
  });

  it('delete comment only removes the comment from its parents replies', () => {
    const comments = new Comments();

    const newRootLevel1 = comments.addComment('root 1');
    const childA = comments.addComment('childA', newRootLevel1);
    const child1 = comments.addComment('child1', newRootLevel1);
    const child2 = comments.addComment('child2', child1);

    comments.deleteComment(child1);

    assert.strictEqual(comments.getComment(newRootLevel1).replies.length, 1);
    assert.strictEqual(
      comments.getComment(newRootLevel1).replies[0].id,
      childA
    );
  });
});
