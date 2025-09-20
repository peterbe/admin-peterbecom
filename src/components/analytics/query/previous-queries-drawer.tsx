import { CodeHighlight } from "@mantine/code-highlight"
import {
  Alert,
  Box,
  Button,
  CloseButton,
  Drawer,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { useState } from "react"
import { formatDistanceCompact } from "../../blogitems/format-distance-compact"
import { Took } from "./took"
import type { PreviousQuery } from "./types"

type Props = {
  opened: boolean
  close: () => void
  previousQueries: PreviousQuery[]
  onUseQuery: (query: string) => void
  setPreviousQueries: (queries: PreviousQuery[]) => void
}
export function PreviousQueriesDrawer({
  opened,
  close,
  previousQueries,
  onUseQuery,
  setPreviousQueries,
}: Props) {
  const [searchPrevious, setSearchPrevious] = useState("")

  const filteredPreviousQueries = previousQueries.filter((pq) => {
    if (!searchPrevious.trim()) return true
    return pq.query.toLowerCase().includes(searchPrevious.toLowerCase())
  })

  return (
    <Drawer
      opened={opened}
      position="top"
      onClose={close}
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
            <CodeHighlight code={pq.query} language="sql" radius="md" mb={10} />
            <SimpleGrid cols={4}>
              <Button
                variant="light"
                onClick={() => {
                  onUseQuery(pq.query)
                  //   setTypedQuery(pq.query)
                  //   submitQuery()
                  //   closeDrawer()
                }}
              >
                Use this query
              </Button>
              <Text>{formatDistanceCompact(pq.created)}</Text>
              {pq.queryResult ? (
                <Text>
                  Rows {pq.queryResult.meta.count_rows.toLocaleString()}. Took{" "}
                  <Took seconds={pq.queryResult.meta.took_seconds} />
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

      <Button onClick={close}>Close</Button>
    </Drawer>
  )
}
