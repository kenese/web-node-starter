export class Comments {
    comments = new Map();

    addComment(text, parentId) {
        const id = crypto.randomUUID();
        this.comments.set(id, {
            id,
            parentId,
            text,
            replies: []
        });

        if (this.comments.has(parentId)) {
            const parent = this.comments.get(parentId);
            if (parent) {
                this.comments.set(parentId, {
                    ...parent,
                    replies: [...parent.replies, id]
                });
            }
        }
        return id;
    }

    getComment(id) {
        const comment = this.comments.get(id);
        if (comment) {
            return {
                ...comment,
                replies: comment.replies.map(reply => this.getComment(reply))
            }
        }
    }

    deleteComment(id) {
        this.removeSelfFromParentReplies(id);
        this.deleteCommentRecursive(id);
    }

    deleteCommentRecursive(id) {
        const deleteComment = this.comments.get(id);

        // remove comment
        this.comments.delete(id);

        // remove all children
        deleteComment.replies.forEach(reply => {
            this.deleteCommentRecursive(reply);
        });
    }

    removeSelfFromParentReplies(id) {
        const deleteComment = this.comments.get(id);
        if (deleteComment.parentId) {
            const parent = this.comments.get(deleteComment.parentId);
            this.comments.set(deleteComment.parentId, {
                ...parent,
                replies: parent.replies.filter(reply => reply !== id)
            });
        }
    }
}
