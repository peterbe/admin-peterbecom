import {
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Grid,
  Group,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { useMediaQuery } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { API_BASE, PUBLIC_BASE_URL } from "../../config"
import {
  commentClassificationQueryKey,
  fetchCommentClassification,
} from "../api-utils"
import { DisplayDate } from "../blogitems/list-table"
import { ApprovalForm } from "./approval-form"
import { ClassifyComment } from "./classify"
import { DisplayClues } from "./clues"
import classes from "./comments-tree.module.css"
import { DisplayLocation } from "./location"
import { SpamSignatureComment } from "./spam-signature"
import type { Comment } from "./types"

export function CommentsTree({
  comments,
  disabled,
  refetchComments,
  showTitles = false,
  toApprove,
  toDelete,
  onCheckApprove,
  onCheckDelete,
  approved,
  deleted,
}: {
  comments: Comment[]
  disabled: boolean
  refetchComments: () => void
  showTitles?: boolean
  toApprove: string[]
  toDelete: string[]
  onCheckApprove: (oid: string) => void
  onCheckDelete: (oid: string) => void
  approved: string[]
  deleted: string[]
}) {
  let prevBlogitem = ""
  const nodes = comments.map((comment) => {
    const newTitle = prevBlogitem !== comment.blogitem.oid
    const title =
      showTitles && newTitle ? (
        <Box
          style={{
            borderBottom: "1px solid var(--mantine-color-gray-3) ",
          }}
          mb={20}
          pb={10}
        >
          <Anchor
            href={`${PUBLIC_BASE_URL}/plog/${comment.blogitem.oid}`}
            fw={700}
            size="xl"
          >
            {comment.blogitem.title}
          </Anchor>
        </Box>
      ) : null

    prevBlogitem = comment.blogitem.oid
    return (
      <Box key={comment.id} mt={newTitle ? 40 : 0} mb={30}>
        {title}
        <InnerComment
          disabled={disabled}
          comment={comment}
          refetchComments={refetchComments}
          toApprove={toApprove}
          toDelete={toDelete}
          onCheckApprove={onCheckApprove}
          onCheckDelete={onCheckDelete}
          approved={approved}
          deleted={deleted}
        />

        <Grid>
          <Grid.Col span={1}> </Grid.Col>
          <Grid.Col span={11}>
            <CommentsTree
              comments={comment.replies}
              disabled={disabled}
              refetchComments={refetchComments}
              toApprove={toApprove}
              toDelete={toDelete}
              onCheckApprove={onCheckApprove}
              onCheckDelete={onCheckDelete}
              approved={approved}
              deleted={deleted}
            />
          </Grid.Col>
        </Grid>
      </Box>
    )
  })

  return <Box>{nodes}</Box>
}

type PostedError = {
  errors: Record<string, string | string[]>
}

function InnerComment({
  comment,
  disabled,
  refetchComments,
  toApprove,
  toDelete,
  onCheckApprove,
  onCheckDelete,
  approved,
  deleted,
}: {
  comment: Comment
  disabled: boolean
  refetchComments: () => void
  toApprove: string[]
  toDelete: string[]
  onCheckApprove: (oid: string) => void
  onCheckDelete: (oid: string) => void
  approved: string[]
  deleted: string[]
}) {
  const [editMode, setEditMode] = useState(false)
  const [classifyMode, setClassifyMode] = useState(false)
  const [spamSignatureMode, setSpamSignatureMode] = useState(false)

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      oid: comment.oid,
      comment: comment.comment,
      name: comment.name || "",
      email: comment.email || "",
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: typeof form.values) => {
      const url = `${API_BASE}/plog/comments/`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (response.status === 400) {
        const json = (await response.json()) as PostedError
        notifications.show({
          title: "Validation errors",
          message: "Look for red",
          color: "red",
        })
        for (const [field, errors] of Object.entries(json.errors)) {
          form.setFieldError(
            field,
            Array.isArray(errors) ? errors.join(", ") : errors,
          )
        }
      } else if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
    onSuccess: () => {
      notifications.show({
        title: "Saved",
        message: "Comment details saved and updated",
        color: "green",
      })
      setEditMode(false)
      refetchComments()
    },
  })

  const isApproved = approved.includes(comment.oid)
  const isDeleted = deleted.includes(comment.oid)

  const queryClient = useQueryClient()

  const [prefetched, setPrefetched] = useState<Set<string>>(() => new Set())
  function prefetchClassify(oid: string) {
    if (!prefetched.has(oid)) {
      setPrefetched((prev) => {
        prev.add(oid)
        return prev
      })
      queryClient.prefetchQuery({
        queryKey: commentClassificationQueryKey(oid),
        queryFn: () => fetchCommentClassification(oid),
        // Prefetch only fires when data is older than the staleTime,
        // so in a case like this you definitely want to set one
        staleTime: 3000,
      })
    }
  }

  const matches = useMediaQuery("(max-width: 56.25em)")
  const leftMargin = matches ? 0 : 54

  return (
    <Box>
      <form
        onSubmit={form.onSubmit((data) => {
          if (data !== null) {
            mutation.mutate(data)
          }
        })}
      >
        <Group>
          <Avatar
            src={comment.gravatar_url}
            alt={comment.name || comment.email || "No name or email"}
            radius="xl"
          />
          <div>
            {editMode ? (
              <Group grow>
                <TextInput
                  label="Name"
                  placeholder="name"
                  key={form.key("name")}
                  {...form.getInputProps("name")}
                  disabled={disabled}
                />
                <TextInput
                  label="Email"
                  placeholder="email"
                  key={form.key("email")}
                  {...form.getInputProps("email")}
                  disabled={disabled}
                />
              </Group>
            ) : (
              <Group>
                <Text size="sm" fw={700}>
                  {comment.name ? <b>{comment.name}</b> : <i>No name</i>}{" "}
                  {comment.email ? <b>{comment.email}</b> : <i>No email</i>}
                </Text>
                <Button
                  title="Add as spam pattern?"
                  size="sm"
                  variant="subtle"
                  onClick={() => setSpamSignatureMode(true)}
                >
                  Ban?
                </Button>
                {comment.location ? (
                  <DisplayLocation location={comment.location} />
                ) : (
                  <em>location not known</em>
                )}
              </Group>
            )}
            {!editMode && (
              <Text size="xs">
                <Anchor
                  href={`${PUBLIC_BASE_URL}/plog/${comment.blogitem.oid}#${comment.oid}`}
                >
                  <DisplayDate date={comment.add_date} />
                  {!equalDates(comment.add_date, comment.modify_date) && (
                    <>
                      , modified <DisplayDate date={comment.modify_date} />
                    </>
                  )}
                </Anchor>
              </Text>
            )}
          </div>
        </Group>
        {editMode ? (
          <Textarea
            ml={leftMargin}
            pt={12}
            mb={10}
            classNames={{ input: classes.input }}
            key={form.key("comment")}
            {...form.getInputProps("comment")}
            autosize
            minRows={3}
            maxRows={10}
            disabled={disabled || mutation.isPending}
          />
        ) : (
          <Text
            pl={leftMargin}
            pt="sm"
            size="sm"
            dangerouslySetInnerHTML={{ __html: comment.rendered }}
          />
        )}

        {form.getValues().comment.includes("<br") && (
          <Box ml={leftMargin}>
            <Button
              variant="light"
              onClick={() => {
                setEditMode(true)
                form.setFieldValue(
                  "comment",
                  comment.comment.replace(/<br\s?\/?>/g, "\n"),
                )
              }}
            >
              Fix <code>&lt;br&gt;</code> breaks?
            </Button>
          </Box>
        )}

        {classifyMode && (
          <ClassifyComment
            comment={comment}
            onClose={() => {
              setClassifyMode(false)
              queryClient.invalidateQueries({
                queryKey: ["comments"],
              })
            }}
          />
        )}

        {spamSignatureMode && (
          <SpamSignatureComment
            comment={comment}
            onClose={() => {
              setSpamSignatureMode(false)
              queryClient.invalidateQueries({
                queryKey: ["comments"],
              })
            }}
          />
        )}

        <Group mt={10}>
          <Button
            ml={leftMargin}
            variant="light"
            onClick={() => {
              if (editMode) {
                if (form.isDirty()) {
                  if (window.confirm("Discard changes?")) {
                    form.reset()
                  } else {
                    return
                  }
                }
              }
              setEditMode((p) => !p)
            }}
            disabled={disabled}
          >
            {editMode ? "Close" : "Edit"}
          </Button>
          {editMode && (
            <Button type="submit" disabled={disabled || mutation.isPending}>
              Save changes
            </Button>
          )}

          <Button
            variant="light"
            color={comment.classification ? "lime" : undefined}
            onClick={() => {
              setClassifyMode((p) => !p)
            }}
            disabled={disabled}
            onMouseEnter={() => {
              if (!classifyMode && !comment.classification) {
                prefetchClassify(comment.oid)
              }
            }}
          >
            {classifyMode
              ? "Close"
              : comment.classification
                ? `"${comment.classification.classification}"`
                : "Classify"}
          </Button>

          {isDeleted ? (
            <Badge
              color="red"
              size="lg"
              variant="gradient"
              gradient={{ from: "red", to: "orange", deg: 138 }}
            >
              Deleted
            </Badge>
          ) : null}
          {isApproved ? (
            <Badge
              color="green"
              size="lg"
              variant="gradient"
              gradient={{ from: "green", to: "cyan", deg: 138 }}
            >
              Approved!
            </Badge>
          ) : null}
          {!isDeleted && !isApproved && !comment.approved && (
            <ApprovalForm
              comment={comment}
              toApprove={toApprove.includes(comment.oid)}
              toDelete={toDelete.includes(comment.oid)}
              onCheckApprove={onCheckApprove}
              onCheckDelete={onCheckDelete}
              disabled={disabled}
            />
          )}
        </Group>

        <DisplayClues clues={comment._clues} />
      </form>
    </Box>
  )
}

// E.g. '2016-05-19T22:07:40.630Z' ==  '2016-05-19T22:07:40.190Z'
function equalDates(a: string, b: string) {
  return a.split(".")[0] === b.split(".")[0]
}
