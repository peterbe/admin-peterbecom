import { ActionIcon, Button, SimpleGrid, Tooltip } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconTrash } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { API_BASE } from "../../config"
import type { Comment } from "./types"

type Props = {
  comment: Comment
  refetchComments: () => void
}

export function DeleteComment({ comment, refetchComments }: Props) {
  const [confirm, setConfirm] = useState(false)

  const deleteComment = useMutation({
    mutationKey: ["delete-comment", comment.oid],
    mutationFn: async () => {
      const url = `${API_BASE}/plog/${comment.blogitem.oid}/comment/${comment.oid}`
      const response = await fetch(url, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
    onError: () => {
      notifications.show({
        title: "Server error",
        message: "Comment could not be deleted",
        color: "red",
      })
    },
    onSuccess: async () => {
      notifications.show({
        title: "Deleted",
        message: "Comment permanently deleted",
        color: "green",
      })
      refetchComments()
    },
  })

  if (!comment.approved) return null

  if (confirm) {
    return (
      <SimpleGrid cols={2}>
        <Button
          disabled={deleteComment.isPending}
          loading={deleteComment.isPending}
          color="red"
          onClick={() => {
            deleteComment.mutate()
          }}
        >
          Confirm delete
        </Button>
        <Button
          disabled={deleteComment.isPending}
          variant="light"
          onClick={() => setConfirm(false)}
          style={{ marginLeft: 8 }}
        >
          Cancel
        </Button>
      </SimpleGrid>
    )
  }

  return (
    <Tooltip label="Permanently delete comment">
      <ActionIcon variant="default" aria-label="Delete">
        <IconTrash
          style={{ width: "70%", height: "70%" }}
          stroke={1.5}
          onClick={() => setConfirm(true)}
        />
      </ActionIcon>
    </Tooltip>
  )
}
