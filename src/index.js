import { CommentsCollection } from './Comment.js';

const comments = new CommentsCollection();

comments.addComment({
  id: '1',
  content: 'Hello, world!',
  author: 'Alice',
});

comments.addComment(
  {
    id: '2',
    content: 'Hello, world!',
    author: 'Bob',
  },
  '1'
);

console.log(comments.getComment('1'));
