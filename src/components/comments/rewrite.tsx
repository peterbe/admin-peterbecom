import {
  Alert,
  Badge,
  Blockquote,
  Button,
  Code,
  Group,
  LoadingOverlay,
  Modal,
  Select,
  Text,
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import {
  commentRewriteQueryKey,
  fetchCommentRewrite,
  fetchValidLLMCallModels,
} from "../api-utils"
import type { Comment } from "./types"
import "./rewrite-styles.css"
import { useLocalStorage } from "@mantine/hooks"
import { IconHourglassHigh, IconReload } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { Fragment } from "react/jsx-runtime"
import { DisplayDate } from "../blogitems/list-table"
import { Took } from "../utils/took"

type RewriteServerData = {
  comment: string
  rewritten: string | null
  html_diff: string | null
  llm_call: {
    model: string
    took_seconds: number
    error: string | null
    status: "success" | "error" | "progress"
    created: string
  }
}

export function RewriteComment({
  comment,
  onClose,
}: {
  comment: Comment
  onClose: (newText?: string) => void
}) {
  const { data, error } = useQuery<{ models: string[] }>({
    queryKey: ["rewrite", "valid-models"],
    // queryFn: () => fetchValidLLMCallModels(),
    queryFn: fetchValidLLMCallModels,
  })

  if (data) {
    return (
      <RewriteCommentInner
        comment={comment}
        onClose={onClose}
        validModels={data.models}
      />
    )
  }

  if (error) {
    return (
      <Alert color="red">Failed to load valid models: {error.message}</Alert>
    )
  }

  return null
}

function RewriteCommentInner({
  comment,
  onClose,
  validModels,
}: {
  comment: Comment
  onClose: (newText?: string) => void
  validModels: readonly string[]
}) {
  const [manuallyLoading, setManuallyLoading] = useState(false)

  const [refetchInterval, setRefetchInterval] = useState<number | false>(false)

  if (validModels.length === 0) {
    throw new Error("No valid models available")
  }
  const defaultModel = validModels[0]

  const [model, setModel] = useLocalStorage<string>({
    key: "rewrite:model",
    defaultValue: defaultModel,
  })

  const { data, error, isPending, refetch } = useQuery<RewriteServerData>({
    queryKey: commentRewriteQueryKey(comment.oid, model),
    queryFn: () => fetchCommentRewrite(comment.oid, model),
    refetchInterval,
  })

  useEffect(() => {
    if (data?.llm_call.status === "progress") {
      setRefetchInterval(3000)
    } else {
      setRefetchInterval(false)
    }
  }, [data])

  return (
    <Modal
      opened={true}
      size="xl"
      onClose={() => {
        onClose()
      }}
      title={isPending ? "Rewrite (loading)" : "Rewrite"}
    >
      <LoadingOverlay visible={isPending} />
      {error && (
        <Alert color="red">
          Failed to load classification: {error.message}
        </Alert>
      )}

      {data && <LLMInfo llm_call={data.llm_call} />}

      <Select
        label="Model"
        placeholder="Pick value"
        data={validModels}
        value={model}
        onChange={(value) => {
          if (value && validModels.includes(value)) {
            setModel(value)
          }
        }}
      />

      <Blockquote color="gray" cite="Before" mt="xl" mb={20}>
        <Lines text={comment.comment.trim()} />
      </Blockquote>

      {data?.llm_call.status === "progress" && (
        <Alert
          color="yellow"
          title="Rewrite in progress"
          icon={<IconHourglassHigh />}
          mb={20}
        >
          The rewrite is still in progress. Please wait a moment and try again.
        </Alert>
      )}

      {data?.llm_call.status === "progress" && (
        <Button
          fullWidth
          variant="outline"
          leftSection={<IconReload />}
          loading={manuallyLoading || Boolean(refetchInterval)}
          disabled={manuallyLoading}
          onClick={() => {
            setManuallyLoading(true)
            setTimeout(() => {
              setManuallyLoading(false)
            }, 2000)
            void refetch()
          }}
        >
          Try now
        </Button>
      )}

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
      <Text>
        <b>Model:</b> <Code>{llm_call.model}</Code>
      </Text>
      {llm_call.status !== "progress" && (
        <Text>
          <b>Took:</b> <Took seconds={llm_call.took_seconds} />
        </Text>
      )}
      <Text>
        <b>Created:</b> <DisplayDate date={llm_call.created} includeSeconds />
      </Text>
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
