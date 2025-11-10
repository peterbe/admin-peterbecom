import {
  Alert,
  Badge,
  Blockquote,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Text,
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { commentRewriteQueryKey, fetchCommentRewrite } from "../api-utils"
import type { Comment } from "./types"
import "./rewrite-styles.css"
import { Fragment } from "react/jsx-runtime"
import { Took } from "../analytics/query/took"

type RewriteServerData = {
  comment: string
  rewritten: string | null
  html_diff: string | null
  llm_call: {
    model: string
    took_seconds: number
    error: string | null
    status: "success" | "error" | "progress"
  }
}

export function RewriteComment({
  comment,
  onClose,
}: {
  comment: Comment
  onClose: (newText?: string) => void
}) {
  const { data, error, isPending } = useQuery<RewriteServerData>({
    queryKey: commentRewriteQueryKey(comment.oid),
    queryFn: () => fetchCommentRewrite(comment.oid),
    retry: false,
  })

  return (
    <Modal
      opened={true}
      size="xl"
      onClose={() => {
        onClose()
      }}
      title={isPending ? "Rewrite (loading)" : "Rewrite"}
    >
      <LoadingOverlay
        visible={isPending || data?.llm_call.status === "progress"}
      />
      {error && (
        <Alert color="red">
          Failed to load classification: {error.message}
        </Alert>
      )}

      {data && <LLMInfo llm_call={data.llm_call} />}

      <Blockquote color="gray" cite="Before" mt="xl">
        <Lines text={comment.comment.trim()} />
      </Blockquote>

      {data && (
        <>
          {data?.llm_call.error && (
            <Alert color="red">{data.llm_call.error}</Alert>
          )}

          {data?.rewritten && (
            <Blockquote color="blue" cite="After" mt="xl" mb={20}>
              <Lines text={data.rewritten.trim()} />
            </Blockquote>
          )}

          {data?.rewritten && (
            <Button
              mb={20}
              fullWidth
              onClick={() => {
                onClose(data.rewritten as string)
              }}
            >
              Start edit
            </Button>
          )}

          {data?.html_diff && (
            <Blockquote color="cyan" cite="Diff" mb={10}>
              <LinesHtml text={data.html_diff.trim()} />
            </Blockquote>
          )}
        </>
      )}
    </Modal>
  )
}

function LLMInfo({ llm_call }: { llm_call: RewriteServerData["llm_call"] }) {
  return (
    <Group justify="center">
      <Text fw={700}>LLM call</Text>
      <Badge
        color={
          llm_call.status === "success"
            ? "green"
            : llm_call.status === "error"
              ? "red"
              : undefined
        }
      >
        {llm_call.status}
      </Badge>
      <Badge variant="light">Model: {llm_call.model}</Badge>
      <Badge variant="light" color="gray">
        Took: <Took seconds={llm_call.took_seconds} />
      </Badge>
    </Group>
  )
}

function Lines({ text }: { text: string }) {
  return text.split("\n").map((line, i, arr) => {
    return (
      <Fragment key={`${line}${i}`}>
        <span>{line}</span>
        {i < arr.length - 1 && <br />}
      </Fragment>
    )
  })
}

function LinesHtml({ text }: { text: string }) {
  return text.split("\n").map((line, i, arr) => {
    return (
      <Fragment key={`${line}${i}`}>
        <span
          dangerouslySetInnerHTML={{
            __html: line,
          }}
        />
        {i < arr.length - 1 && <br />}
      </Fragment>
    )
  })
}
