import {
  CodeHighlight,
  CodeHighlightAdapterProvider,
} from "@mantine/code-highlight"
import {
  Alert,
  Box,
  Button,
  CloseButton,
  Code,
  Drawer,
  Paper,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core"
import { useDisclosure, useLocalStorage } from "@mantine/hooks"
import Editor from "@monaco-editor/react"
import { IconSearch } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import type { editor } from "monaco-editor"
import { KeyCode, KeyMod } from "monaco-editor"
import { useEffect, useRef, useState } from "react"
import { formatDistanceCompact } from "../../blogitems/format-distance-compact"
import type { QueryResult } from "../types"
import { getEditorHeight } from "./editor-height"
import { KeyboardTip } from "./keyboard-tip"
import { shikiAdapter } from "./load-shiki"
import { Show } from "./show"
import { Took } from "./took"
import { useQueryDocumentTitle } from "./use-query-document-title"

type PreviousQuery = {
  query: string
  created: string
  queryResult?: QueryResult
}

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

  const editorHeight = getEditorHeight(activeQuery)

  const [searchPrevious, setSearchPrevious] = useState("")

  const filteredPreviousQueries = previousQueries.filter((pq) => {
    if (!searchPrevious.trim()) return true
    return pq.query.toLowerCase().includes(searchPrevious.toLowerCase())
  })

  return (
    <CodeHighlightAdapterProvider adapter={shikiAdapter}>
      <div>
        <Drawer
          opened={openedDrawer}
          position="top"
          onClose={closeDrawer}
          title={`Past queries (${previousQueries.length})`}
          size="xl"
        >
          <TextInput
            mb={20}
            placeholder="Search"
            aria-label="Search"
            value={searchPrevious}
            onChange={(e) => setSearchPrevious(e.target.value)}
            radius="xl"
            rightSection={
              searchPrevious ? (
                <CloseButton
                  aria-label="Clear input"
                  onClick={() => setSearchPrevious("")}
                />
              ) : (
                <IconSearch />
              )
            }
          />
          {searchPrevious && !filteredPreviousQueries.length && (
            <Alert color="yellow">No previous queries found</Alert>
          )}

          {filteredPreviousQueries.map((pq) => {
            return (
              <Box key={pq.query} mb={30}>
                <CodeHighlight
                  code={pq.query}
                  language="sql"
                  radius="md"
                  mb={10}
                />
                <SimpleGrid cols={4}>
                  <Button
                    variant="light"
                    onClick={() => {
                      setTypedQuery(pq.query)
                      submitQuery()
                      closeDrawer()
                    }}
                  >
                    Use this query
                  </Button>
                  <Text>{formatDistanceCompact(pq.created)}</Text>
                  {pq.queryResult ? (
                    <Text>
                      Rows {pq.queryResult.meta.count_rows.toLocaleString()}.{" "}
                      Took <Took seconds={pq.queryResult.meta.took_seconds} />
                    </Text>
                  ) : (
                    <Text fs="italic">Not run before</Text>
                  )}
                  <Button
                    variant="light"
                    color="red"
                    onClick={() => {
                      const filtered = previousQueries.filter(
                        (x) => x.query !== pq.query,
                      )
                      if (filtered.length < previousQueries.length) {
                        setPreviousQueries(filtered)
                      } else {
                        console.error("Did not filter anything out")
                      }
                    }}
                  >
                    Delete
                  </Button>
                </SimpleGrid>
              </Box>
            )
          })}

          <Button onClick={closeDrawer}>Close</Button>
        </Drawer>

        {previousQueries.length > 0 && (
          <Box mb={10}>
            <Button variant="default" onClick={openDrawer}>
              ({previousQueries.length}) Previous queries
            </Button>
          </Box>
        )}
        <Editor
          // height="90vh"
          height={`${editorHeight}px`}
          language="sql"
          theme="vs-light"
          // theme={theme.colorScheme === "dark" ? "vs-dark" : "light"}
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
        <Button mt={10} onClick={submitQuery} disabled={!typedQuery.trim()}>
          Run query
        </Button>

        <KeyboardTip />

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
    </CodeHighlightAdapterProvider>
  )
}
