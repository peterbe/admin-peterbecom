import {
  CodeHighlight,
  CodeHighlightAdapterProvider,
} from "@mantine/code-highlight"
import { Alert, Box, Button, Grid, Loader, Paper } from "@mantine/core"
import { useDisclosure, useLocalStorage } from "@mantine/hooks"
import Editor from "@monaco-editor/react"
import { useQuery } from "@tanstack/react-query"
import type { editor } from "monaco-editor"
import { KeyCode, KeyMod } from "monaco-editor"
import { useEffect, useRef, useState } from "react"
import type { QueryResult } from "../types"
import { AllTablesModal } from "./all-tables-modal"
import { getEditorHeight } from "./editor-height"
import { KeyboardTip } from "./keyboard-tip"
import { shikiAdapter } from "./load-shiki"
import { PreviousQueriesDrawer } from "./previous-queries-drawer"
import { Show } from "./show"
import type { PreviousQuery } from "./types"
import { useQueryDocumentTitle } from "./use-query-document-title"

export function Component() {
  const [savedQueries, _setSavedQueries, removeSavedQueries] = useLocalStorage({
    key: "saved-queries",
    defaultValue: "",
  })

  const [previousQueries, setPreviousQueries] = useLocalStorage<
    PreviousQuery[]
  >({
    key: "previous-queries",
    defaultValue: [],
  })
  const [activeQuery, setActiveQuery] = useLocalStorage({
    key: "active-query",
    defaultValue: "",
  })

  const hasMigrated = useRef(false)
  useEffect(() => {
    if (savedQueries && !hasMigrated.current && !previousQueries.length) {
      const split = savedQueries.split("\n\n").filter((x) => x.trim())
      if (split.length) {
        console.log(split.length)
        const date = new Date()
        const migrated: PreviousQuery[] = []
        for (const q of split) {
          date.setSeconds(date.getSeconds() - 1)
          migrated.push({ query: q, created: date.toISOString() })
        }
        if (migrated.length) {
          setPreviousQueries(migrated)
        }
        hasMigrated.current = true
        removeSavedQueries()
      }
    }
  }, [savedQueries, previousQueries, removeSavedQueries, setPreviousQueries])

  const [typedQuery, setTypedQuery] = useState(activeQuery)

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

  useEffect(() => {
    if (data) {
      const hash = (s: string) => s.trim().replace(/\s+/g, " ")
      const needle = hash(activeQuery)
      const already = previousQueries.find((x) => hash(x.query) === needle)
      if (!already) {
        const pq: PreviousQuery = {
          query: activeQuery,
          created: new Date().toISOString(),
          queryResult: data,
        }
        const pqs = [pq, ...previousQueries]
        if (pqs.length > 50) {
          pqs.splice(50, pqs.length - 50)
        }
        setPreviousQueries(pqs)
      }
    }
  }, [data, activeQuery, previousQueries, setPreviousQueries])

  useQueryDocumentTitle(error, isPending, data)

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  function submitQuery() {
    setActiveQuery(`${typedQuery.trim()}\n`)
  }

  const monacoEditor = editorRef.current

  if (monacoEditor) {
    monacoEditor.addCommand(KeyCode.Enter | KeyMod.CtrlCmd, () => {
      // Your code to execute when Ctrl/Cmd + Enter is pressed
      // console.log("Ctrl/Cmd + Enter pressed!")
      if (!typedQuery.trim()) {
        console.warn("No typed query yet")
        return
      }

      if (editorRef.current) {
        submitQuery()
      }
    })
  }
  const [openedDrawer, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false)
  const [
    openedAllTablesModal,
    { close: closeAllTablesModal, toggle: toggleAllTablesModal },
  ] = useDisclosure(false)

  const editorHeight = getEditorHeight(activeQuery)

  return (
    <CodeHighlightAdapterProvider adapter={shikiAdapter}>
      <div>
        <AllTablesModal
          opened={openedAllTablesModal}
          onClose={closeAllTablesModal}
        />

        <PreviousQueriesDrawer
          opened={openedDrawer}
          close={closeDrawer}
          previousQueries={previousQueries}
          onUseQuery={(query: string) => {
            setTypedQuery(query)
            submitQuery()
            closeDrawer()
          }}
          setPreviousQueries={(queries: PreviousQuery[]) => {
            setPreviousQueries(queries)
          }}
        />

        <Grid>
          <Grid.Col span={4}>
            {previousQueries.length > 0 && (
              <Box mb={10}>
                <Button variant="default" onClick={openDrawer}>
                  ({previousQueries.length}) Previous queries
                </Button>
              </Box>
            )}
          </Grid.Col>
          <Grid.Col span={8}>
            <KeyboardTip />
          </Grid.Col>
        </Grid>

        <Editor
          height={`${editorHeight}px`}
          language="sql"
          theme="vs-light"
          defaultValue="select * from analytics order by created desc limit 20"
          value={typedQuery}
          onChange={(value) => {
            if (value !== undefined) setTypedQuery(value)
          }}
          onMount={(editor) => {
            editorRef.current = editor
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,

            // automaticLayout: true,
          }}
        />

        <Grid mb={10}>
          <Grid.Col span={4}>
            <Button onClick={submitQuery} disabled={!typedQuery.trim()}>
              Run query
            </Button>
          </Grid.Col>

          <Grid.Col span={4}>
            {isPending && <Loader color="blue" />}
            {!isPending && (
              <Button variant="light" onClick={toggleAllTablesModal}>
                All tables
              </Button>
            )}
          </Grid.Col>
        </Grid>
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
            Active query:
            <CodeHighlight
              code={activeQuery}
              language="sql"
              radius="md"
              withCopyButton={false}
              mb={10}
            />
          </Paper>
        )}
      </div>
    </CodeHighlightAdapterProvider>
  )
}
