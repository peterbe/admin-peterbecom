import { Modal } from "@mantine/core"
import { AddSignature } from "../spam/add-signature"
import type { Comment } from "./types"

export function SpamSignatureComment({
  comment,
  onClose,
}: {
  comment: Comment
  onClose: () => void
}) {
  return (
    <Modal opened={true} onClose={onClose} title="Spam Comment Signature">
      <AddSignature
        name={comment.name}
        email={comment.email}
        onSuccess={onClose}
      />
    </Modal>
  )
}
