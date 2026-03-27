export class Comments {
  comments = new Map();
  rootCommentId;

  constructor() {
    this.rootCommentId = crypto.randomUUID();

    this.comments.set(this.rootCommentId, {
      id: this.rootCommentId,
      replies: [],
    });
  }

  addComment(text, parentId = this.rootCommentId) {
    const id = crypto.randomUUID();
    const newComment = {
      id,
      text,
      parentId,
      replies: [],
    };
    this.comments.get(parentId).replies.push(id);
    this.comments.set(id, newComment);
    return id;
  }

  getComment(commentId = this.rootCommentId) {
    if (this.comments.has(commentId)) {
      const comment = this.comments.get(commentId);
      const replies = comment.replies.map((replyId) =>
        this.getComment(replyId)
      );

      return {
        ...comment,
        replies,
      };
    }
  }

  deleteComment(commentId) {
    if (!commentId) {
      throw new Error('commentId is required');
    }

    if (!this.comments.has(commentId)) {
      throw new Error('comment not found');
    }

    const { replies, parentId } = this.comments.get(commentId);
    this.comments.delete(commentId);
    if (replies.length) {
      replies.forEach((replyId) => {
        this.comments.delete(replyId);
      });
    }
    const parentCommentId = this.comments.get(parentId);
    parentCommentId.replies = parentCommentId.replies.filter(
      (parentReplyId) => commentId !== parentReplyId
    );
  }
}
