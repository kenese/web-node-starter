import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CommentsCollection } from '../src/Comment.js';

describe('CommentsCollection', () => {
  it('creates an empty collection', () => {
    const collection = new CommentsCollection();
    assert.strictEqual(collection.comments.size, 0);
  });

  it('adds a comment to root when no parent passed', () => {
    const collection = new CommentsCollection();
    collection.addComment({
      id: '1',
      content: 'Test content',
      author: 'Test Author',
    });

    assert.strictEqual(collection.comments.size, 1);
    const comment = collection.comments.get('1');
    assert.strictEqual(comment.content, 'Test content');
    assert.strictEqual(comment.author, 'Test Author');
    assert.deepStrictEqual(comment.replies, []);
  });

  it('adds a comment as reply when passed a parent comment', () => {
    const collection = new CommentsCollection();
    collection.addComment({ id: '1', content: 'Parent', author: 'Alice' });
    collection.addComment({ id: '2', content: 'Reply', author: 'Bob' }, '1');

    assert.strictEqual(collection.comments.size, 2);
    assert.deepStrictEqual(collection.comments.get('1').replies, ['2']);
    assert.strictEqual(collection.comments.get('2').parentId, '1');
  });

  it('throws when getting non-existent comment', () => {
    const collection = new CommentsCollection();
    assert.throws(() => collection.getComment('999'), {
      message: 'Comment not found',
    });
  });

  it('getComment returns replies of a comment', () => {
    const collection = new CommentsCollection();
    collection.addComment({ id: '1', content: 'Parent', author: 'Alice' });
    collection.addComment({ id: '2', content: 'Reply', author: 'Bob' }, '1');

    const comment = collection.getComment('1');
    assert.strictEqual(comment.replies.length, 1);
    assert.strictEqual(comment.replies[0].replies.length, 0); // reply has no nested replies
  });

  it('getComment returns replies of a comment recursively', () => {
    const collection = new CommentsCollection();
    collection.addComment({ id: '1', content: 'Parent', author: 'Alice' });
    collection.addComment({ id: '2', content: 'Reply1', author: 'Bob' }, '1');
    collection.addComment(
      { id: '3', content: 'Reply2', author: 'Charlie' },
      '2'
    );
    collection.addComment({ id: '4', content: 'Reply3', author: 'David' }, '3');
    collection.addComment({ id: '5', content: 'Reply4', author: 'Eve' }, '4');

    const comment = collection.getComment('1');

    assert.strictEqual(comment.content, 'Parent');
    assert.strictEqual(comment.replies.length, 1);
    assert.strictEqual(comment.replies[0].content, 'Reply1');
    assert.strictEqual(comment.replies[0].replies[0].content, 'Reply2');
    assert.strictEqual(
      comment.replies[0].replies[0].replies[0].content,
      'Reply3'
    );
    assert.strictEqual(
      comment.replies[0].replies[0].replies[0].replies[0].content,
      'Reply4'
    );
    assert.strictEqual(
      comment.replies[0].replies[0].replies[0].replies[0].replies.length,
      0
    );
  });

  it('getComments returns the comments map', () => {
    const collection = new CommentsCollection();
    collection.addComment({ id: '1', content: 'Test', author: 'Alice' });

    const comments = collection.getComments();
    assert.ok(comments instanceof Map);
    assert.strictEqual(comments.size, 1);
  });

  it('deletes a comment', () => {
    const collection = new CommentsCollection();
    collection.addComment({ id: '1', content: 'Test', author: 'Alice' });
    collection.deleteComment('1');
    assert.strictEqual(collection.comments.size, 0);
  });

  it('deletes a comment and all replies', () => {
    const collection = new CommentsCollection();
    collection.addComment({ id: '1', content: 'Test', author: 'Alice' });
    collection.addComment({ id: '2', content: 'Reply', author: 'Bob' }, '1');
    collection.addComment(
      { id: '3', content: 'Reply', author: 'Charlie' },
      '2'
    );
    collection.deleteComment('1');

    assert.strictEqual(collection.comments.size, 0);
  });

  it('deletes only expected comment, not other comments and all replies', () => {
    const collection = new CommentsCollection();
    collection.addComment({ id: '1', content: 'Test', author: 'Alice' });
    collection.addComment({ id: '4', content: 'Test', author: 'Darren' });
    collection.addComment({ id: '5', content: 'Test', author: 'Eric' });
    collection.addComment({ id: '2', content: 'Reply', author: 'Bob' }, '1');
    collection.addComment(
      { id: '3', content: 'Reply', author: 'Charlie' },
      '2'
    );
    collection.deleteComment('1');

    assert.ok(!collection.comments.has('1'));
    assert.ok(collection.comments.has('4'));
    assert.ok(collection.comments.has('5'));
    assert.strictEqual(collection.comments.size, 2);
  });

  it('delete removes commentId from parent comment replies', () => {
    const collection = new CommentsCollection();
    collection.addComment({ id: '1', content: 'Comment', author: 'Alice' });
    collection.addComment(
      { id: '2', content: 'Reply1', author: 'Darren' },
      '1'
    );
    collection.addComment({ id: '3', content: 'Reply2', author: 'Bob' }, '1');
    collection.addComment(
      { id: '4', content: 'Reply3', author: 'Charlie' },
      '2'
    );
    collection.deleteComment('2');

    assert.strictEqual(
      collection.comments.get('1').replies.length,
      1,
      'after deleting comment 2, comment 1 should only have 1 reply'
    );
    assert.strictEqual(
      collection.comments.get('1').replies[0],
      '3',
      'after deleting comment 2, comment 1 should list reply 3'
    );
    assert.ok(collection.comments.has('3'));

    assert.ok(!collection.comments.has('2'));
    assert.ok(!collection.comments.has('4'));
  });
});
