export class CommentsCollection {

  comments;

  constructor() {
    this.comments = new Map();
  }

  addComment(comment, parentId) {
    // adding comment to root if no parent id
    if (!parentId) {
      this.comments.set(comment.id, { ...comment, replies: [] });
      return;
    }
    if (parentId && !this.comments.has(parentId)) {
      throw new Error('Parent comment not found');
    }
    // adding comment as reply to parent comment
    this.comments.set(comment.id, { ...comment, parentId, replies: [] });
    this.comments.get(parentId).replies.push(comment.id);
  }

  getComment(commentId) {
    if (!this.comments.has(commentId)) {
      throw new Error('Comment not found');
    }
    const children =
      this.comments.get(commentId).replies;
    return {
      ...this.comments.get(commentId),
      replies: children.map(childId => this.getComment(childId)),
    }
  }

  getComments() {
    // should this be a tree with root node as  dummmy comment????
    return this.comments;
  }

  deleteComment(commentId) {
    if (!this.comments.has(commentId)) {
      throw new Error('Comment not found');
    }
    const comment = this.comments.get(commentId);
    const parentId = comment.parentId;
    if (parentId) {
      this.comments.get(parentId).replies = this.comments.get(parentId).replies.filter(id => id !== commentId);
    }
    comment.replies.forEach(childCommentId => {
      this.deleteComment(childCommentId);
    });
    this.comments.delete(commentId);
  }
}
