const comments = new Comments();

const A = comments.addComment('AAA');
const B = comments.addComment('BBB', A);
const C = comments.addComment('CCC', A);
const D = comments.addComment('DDD', B);
const E = comments.addComment('EEE', C);

console.log(comments.getComments());
