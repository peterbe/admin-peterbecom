import { Checkbox, Group } from "@mantine/core";
import classes from "./ApprovalForm.module.css";
import type { Comment } from "./types";

export function ApprovalForm({
  comment,
  toApprove,
  toDelete,
  onCheckApprove,
  onCheckDelete,
}: {
  comment: Comment;
  toApprove: boolean;
  toDelete: boolean;
  onCheckApprove: (oid: string) => void;
  onCheckDelete: (oid: string) => void;
}) {
  return (
    <Group>
      <Checkbox
        classNames={classes}
        checked={toApprove}
        label="Approve"
        color="green"
        onChange={() => {
          onCheckApprove(comment.oid);
        }}
        wrapperProps={{
          onClick: () => onCheckApprove(comment.oid),
        }}
      />
      <Checkbox
        classNames={classes}
        checked={toDelete}
        label="Delete"
        color="red"
        onChange={() => {
          onCheckDelete(comment.oid);
        }}
        wrapperProps={{
          onClick: () => onCheckDelete(comment.oid),
        }}
      />
    </Group>
  );
}
