import {
  Alert,
  Code,
  Container,
  Kbd,
  Paper,
  Text,
  Textarea,
} from "@mantine/core"
import { useDocumentTitle, useLocalStorage } from "@mantine/hooks"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { useState } from "react"

import classes from "./query.module.css"

import type { QueryResult } from "../types"
import { Show } from "./show"

export function Component() {
  const [value, setValue] = useLocalStorage({
    key: "saved-queries",
    defaultValue: "",
  })
  const [activeQuery, setActiveQuery] = useLocalStorage({
    key: "active-query",
    defaultValue: "",
  })

  const [typedQuery, setTypedQuery] = useState(value)
  useEffect(() => {
    if (value && !typedQuery) {
      setTypedQuery(value)
    }
  }, [value, typedQuery])

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const textareaElement = textareaRef.current
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Enter" && event.metaKey) {
        if (!typedQuery.trim()) {
          console.warn("No typed query yet")

          return
        }
        if (textareaRef.current) {
          const extracted = extractActiveQuery(typedQuery, textareaRef.current)
          if (extracted.length <= 1) {
            // console.log({ typedQuery, extracted })
            throw new Error("Extracting query from position failed")
          }

          setActiveQuery(extracted)
          setValue(typedQuery)
        }
      }
    }
    if (textareaElement) textareaElement.addEventListener("keydown", listener)

    return () => {
      if (textareaElement)
        textareaElement.removeEventListener("keydown", listener)
    }
  }, [textareaElement, typedQuery, setActiveQuery, setValue])

  let xhrUrl = null
  if (activeQuery.trim()) {
    const sp = new URLSearchParams()
    sp.set("query", activeQuery)
    xhrUrl = `/api/v0/analytics/query?${sp}`
  }

  const { isPending, error, data, isFetching, refetch } = useQuery<QueryResult>(
    {
      queryKey: ["query", activeQuery, xhrUrl],
      queryFn: async () => {
        if (!xhrUrl) return null
        const response = await fetch(xhrUrl)
        if (!response.ok) {
          if (response.status === 400) {
            const json = await response.json()
            if (json.error) {
              //   throw new Error(json.error)
              // }
              return {
                rows: [],
                meta: {
                  took_seconds: 0,
                  count_rows: 0,
                  maxed_rows: false,
                },
                error: json.error,
              }
            }
          }
          throw new Error(`${response.status} on ${response.url}`)
        }
        return response.json()
      },
    },
  )

  let title = "Query"
  if (error) {
    title = "Error in query"
  } else if (isPending) {
    title = "Loading query..."
  } else if (data) {
    title = `${data.meta.count_rows.toLocaleString()} rows`
  }
  useDocumentTitle(title)

  return (
    <div>
      <Textarea
        placeholder="select * from analytics order by created desc limit 20"
        label="SQL Query"
        resize="both"
        autosize
        minRows={4}
        maxRows={30}
        autoFocus
        required
        classNames={{ input: classes.textarea }}
        style={{ width: "100%" }}
        ref={textareaRef}
        value={typedQuery}
        onChange={(event) => {
          setTypedQuery(event.target.value)
        }}
        autoCorrect="off"
      />
      <Container mb={20}>
        <Text size="sm" ta="right">
          Use <Kbd>⌘</Kbd>-<Kbd>Enter</Kbd> to run the query when focus is
          inside textarea
        </Text>
      </Container>

      {isPending && <Alert color="gray">Loading...</Alert>}
      {error ? (
        <Alert color={error.message.includes("500") ? "red" : "yellow"}>
          <pre style={{ margin: 0 }}>{error.message}</pre>
        </Alert>
      ) : data?.error ? (
        <Alert color="yellow">
          <pre style={{ margin: 0 }}>{data.error}</pre>
        </Alert>
      ) : null}

      {data && !data.error && (
        <Show data={data} isFetching={isFetching} refetch={() => refetch()} />
      )}

      {activeQuery && (
        <Paper mt="xl">
          Active query: <Code>{activeQuery}</Code>
        </Paper>
      )}
    </div>
  )
}

function extractActiveQuery(typedQuery: string, textarea: HTMLTextAreaElement) {
  let a = textarea.selectionStart
  let b = textarea.selectionEnd
  while (a) {
    const here = typedQuery.substring(a - 2, a)
    if (here === "\n\n") {
      break
    }
    a--
  }
  while (b < typedQuery.length) {
    const here = typedQuery.substring(b, b + 2)
    if (here === "\n\n") {
      break
    }
    b++
  }
  return typedQuery.substring(a, b)
}
