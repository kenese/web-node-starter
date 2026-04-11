
export class Comments {

    comments = new Map();

    addComment(text, parentId) {
        const id = crypto.randomUUID();

        this.comments.set(id, {
            id,
            text,
            parentId,
            replies: []
        });

        if (parentId && this.comments.has(parentId)) {
            const parentComment = this.comments.get(parentId);
            this.comments.set(parentId, {
                ...parentComment,
                replies: [...parentComment.replies, id]
            });
        }
        return id;
    }

    getComment(commentId) {
        const comment = this.comments.get(commentId);
        if (!comment) return;

        return {
            ...comment,
            replies: comment.replies.map(reply => this.getComment(reply))
        }
    }

    deleteComment(commentId) {
        const comment = this.comments.get(commentId);
        if (!comment) return;
        this.comments.delete(commentId);

        // remove self from parents reply array
        if (comment.parentId && this.comments.has(comment.parentId)) {
            const parentComment = this.comments.get(comment.parentId);
            this.comments.set(comment.parentId, {
                ...parentComment,
                replies: parentComment.replies.filter(reply => reply !== commentId)
            });
        }

        // remove all children
        if (comment.replies.length) {
            comment.replies.forEach((replyId) => {
                this.deleteComment(replyId);
            })
        }
    }
}

const comments = new Comments();

const A = comments.addComment('AAA');
const B = comments.addComment('BBB');
const C = comments.addComment('CCC', A);
const D = comments.addComment('DDD', B);
const E = comments.addComment('EEE', C);
const F = comments.addComment('FFF', C);

console.log(A);
console.log(B);
console.log(C);
console.log(D);
console.log(E);
console.log(F);

console.log(comments.getComment(A));
console.log(comments.getComment(B));
console.log(comments.getComment(C));
console.log(comments.getComment(D));
console.log(comments.getComment(E));
console.log(comments.getComment(F));

