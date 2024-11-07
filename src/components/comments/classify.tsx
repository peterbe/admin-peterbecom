import {
  Alert,
  Button,
  Divider,
  Group,
  LoadingOverlay,
  Modal,
  SimpleGrid,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { API_BASE } from "../../config"
import {
  commentClassificationQueryKey,
  fetchCommentClassification,
} from "../api-utils"
import { DisplayDate } from "../blogitems/list-table"
import type { Classification, Comment } from "./types"

type Choice = {
  value: string
  count: number
}
type ClassifyServerData = {
  classification: Classification | null
  choices: Choice[]
}
type PostedError = {
  errors: Record<string, string | string[]>
}

export function ClassifyComment({
  comment,
  onClose,
}: {
  comment: Comment
  onClose: () => void
}) {
  const [text, setText] = useState(comment.comment)

  useEffect(() => {
    setText(comment.comment)
  }, [comment.comment])

  const { data, error, isPending, isLoading } = useQuery<ClassifyServerData>({
    queryKey: commentClassificationQueryKey(comment.oid),
    queryFn: () => fetchCommentClassification(comment.oid),
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: commentClassificationQueryKey(comment.oid),
    mutationFn: async ({
      text,
      classification,
    }: {
      text: string
      classification: string
    }) => {
      const response = await fetch(
        `${API_BASE}/plog/comments/${comment.oid}/classify/`,
        {
          method: "POST",
          body: JSON.stringify({
            classification,
            text,
          }),
        },
      )
      if (response.status === 400) {
        const errors = (await response.json()) as PostedError
        throw new Error(JSON.stringify(errors.errors))
      }
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
    onSuccess: () => {
      notifications.show({
        title: "Classified",
        message: "Comment text classification saved",
        color: "green",
      })
      queryClient.invalidateQueries({
        queryKey: commentClassificationQueryKey(comment.oid),
      })

      onClose()
    },
  })

  const deleteMutation = useMutation({
    mutationKey: [...commentClassificationQueryKey(comment.oid), "delete"],
    mutationFn: async () => {
      if (!data?.classification) {
        return null
      }
      const sp = new URLSearchParams({ id: `${data.classification.id}` })
      const response = await fetch(
        `${API_BASE}/plog/comments/${comment.oid}/classify/?${sp.toString()}`,
        {
          method: "DELETE",
        },
      )
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
    onSuccess: () => {
      notifications.show({
        title: "Removed",
        message: "Comment text classification deleted",
        color: "green",
      })
      queryClient.invalidateQueries({
        queryKey: commentClassificationQueryKey(comment.oid),
      })

      onClose()
    },
  })

  const [classification, setClassification] = useState<string | null>()
  useEffect(() => {
    setClassification(data?.classification?.classification || null)
  }, [data?.classification])

  const [newClassficication, setNewClassification] = useState("")

  return (
    <Modal opened={true} onClose={onClose} title="Classify">
      <LoadingOverlay visible={isPending} />
      {error && (
        <Alert color="red">
          Failed to load classification: {error.message}
        </Alert>
      )}

      {data && (
        <Group>
          {data.choices.map((choice) => {
            return (
              <Button
                key={choice.value}
                disabled={mutation.isPending}
                fullWidth
                variant="light"
                color="cyan"
                onClick={() => {
                  mutation.mutate({
                    text,
                    classification: choice.value,
                  })
                }}
              >
                {choice.value} ({choice.count})
              </Button>
            )
          })}
        </Group>
      )}

      <TextInput
        label="New classification"
        description="Always lower case"
        disabled={mutation.isPending || !data}
        value={newClassficication}
        onChange={(event) => setNewClassification(event.currentTarget.value)}
      />

      <Textarea
        label="Text"
        placeholder="Comment text here..."
        value={text}
        autosize
        onChange={(event) => setText(event.currentTarget.value)}
        disabled={isLoading || mutation.isPending}
      />

      <Button
        mt={20}
        mb={20}
        disabled={!(classification || newClassficication) || mutation.isPending}
        onClick={() => {
          if (newClassficication) {
            mutation.mutate({
              text,
              classification: newClassficication,
            })
          }
        }}
      >
        Submit classification
      </Button>

      {data?.classification && (
        <>
          <Divider mb={10} />
          <SimpleGrid cols={2}>
            <Text size="sm">
              modified <DisplayDate date={data.classification.modify_date} />
            </Text>
            <Button
              color="orange"
              size="xs"
              onClick={() => {
                deleteMutation.mutate()
              }}
            >
              Delete
            </Button>
          </SimpleGrid>
        </>
      )}
    </Modal>
  )
}
