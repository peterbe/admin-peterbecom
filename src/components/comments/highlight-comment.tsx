import {
  ActionIcon,
  Alert,
  Button,
  LoadingOverlay,
  Modal,
  Text,
  Tooltip,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { IconHeart, IconHeartFilled } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { API_BASE } from "../../config"
import type { Comment } from "./types"

type Props = {
  comment: Comment
  refetchComments: () => void
}

type HighlightResponse = {
  highlighted: string | null
}

export function HighlightComment({ comment, refetchComments }: Props) {
  const [opened, { open, close }] = useDisclosure(false)

  const mutation = useMutation<HighlightResponse>({
    mutationKey: ["highlight-comment", comment.oid],
    mutationFn: async () => {
      const url = `${API_BASE}/plog/${comment.blogitem.oid}/comment/${comment.oid}`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toggle_highlight: true,
        }),
      })
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
    onError: () => {
      notifications.show({
        title: "Server error",
        message: "Comment could not be highlighted",
        color: "red",
      })
    },
    onSuccess: (data) => {
      console.log(data)
      notifications.show({
        title: "Highlight status changed",
        message: data.highlighted
          ? "Comment is now highlighted"
          : "Comment is now NOT highlighted",
        color: "green",
      })
      refetchComments()
      close()
    },
  })

  return (
    <>
      <Modal opened={opened} onClose={close} title="Change Highlighted Status">
        <LoadingOverlay visible={mutation.isPending} />
        {mutation.error && (
          <Alert color="red">Failed to toggle: {mutation.error.message}</Alert>
        )}

        {comment.highlighted && (
          <Text>
            This comment has been highlighted since <b>{comment.highlighted}</b>
          </Text>
        )}
        {!comment.highlighted && (
          <Text fs="italic">This comment is not highlighted</Text>
        )}

        <Button
          variant={comment.highlighted ? "outline" : "filled"}
          fullWidth
          disabled={mutation.isPending}
          onClick={() => {
            mutation.mutate()
          }}
        >
          {comment.highlighted ? "Unhighlight" : "Highlight!"}
        </Button>
      </Modal>
      <Tooltip
        label={
          comment.highlighted
            ? `This has been highlighted since ${comment.highlighted}`
            : "Toggle to highlight comment"
        }
      >
        <ActionIcon variant="default" aria-label="Delete">
          {comment.highlighted ? (
            <IconHeartFilled
              style={{ width: "90%", height: "90%", color: "red" }}
              stroke={1.5}
              onClick={open}
            />
          ) : (
            <IconHeart
              style={{ width: "70%", height: "70%" }}
              stroke={1.5}
              onClick={open}
            />
          )}
        </ActionIcon>
      </Tooltip>
    </>
  )
}
