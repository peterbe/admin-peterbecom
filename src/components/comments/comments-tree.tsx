import type { Comment } from "./types";

export function CommentsTree({
  comments,
  disabled,
}: {
  comments: Comment[];
  disabled: boolean;
}) {
  console.log({ disabled });

  return (
    <div>
      {comments.map((comment) => (
        <div key={comment.id}>
          <h5>
            {comment.name}/{comment.email}
          </h5>
          <p>{comment.comment}</p>
        </div>
      ))}
    </div>
  );
}
