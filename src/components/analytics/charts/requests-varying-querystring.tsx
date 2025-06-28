import { Box, Grid, Table } from "@mantine/core"
import { useClipboard } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { useQuery as tsq_useQuery } from "@tanstack/react-query"
import escapeString from "escape-sql-string"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import type { QueryResult, QueryResultRow } from "../types"
import { DisplayError, DisplayWarning } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { apiPrefix, fetcher } from "./fetcher"
import { IntervalOptions } from "./interval-options"
import { Loading } from "./loading"
import { RowsOptions } from "./rows-options"
import { useInterval } from "./use-interval"
import { type QueryOptions, useSQLQuery } from "./use-query"
import { useRows } from "./use-rows"

const sqlQuery = ({ limit = 200, days = 30, back = 0 } = {}) => `
SELECT request->>'path' AS path, COUNT(*) AS count
FROM requestlog 
where 
    ${createdRange(days, back)}
    AND url != request->>'path' 
GROUP BY request->>'path'
ORDER BY 2 desc 
LIMIT ${Number(limit)}
`

const sqlSearchQuery = (
  path: string,
  { limit = 200, days = 30, back = 0 } = {},
) => `
SELECT url, COUNT(*) AS count
FROM requestlog 
where 
    ${createdRange(days, back)}
    AND request->>'path' = ${escapeString(path)}
GROUP BY url
ORDER BY 2 desc 
LIMIT ${Number(limit)}
`

const ID = "requests-varying-querystring"

export function RequestsVaryingQuerystring() {
  return (
    <ChartContainer id={ID} title="Requests Varying Querystring">
      <Inner />
    </ChartContainer>
  )
}
function Inner() {
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const [intervalDays, setIntervalDays] = useInterval(ID)
  const [rows, setRows] = useRows(ID, 10)
  const current = useQuery(
    sqlQuery({ limit: Number(rows), days: Number(intervalDays) }),
  )

  const [searchParams] = useSearchParams()
  const searchPath = searchParams.get("searchPath")
  const searchQuery = tsq_useQuery<QueryResult>({
    queryKey: ["search-query", ID, searchPath],
    queryFn: async () => {
      if (!searchPath) throw new Error("not selected")
      const query = sqlSearchQuery(searchPath, {
        limit: Number(rows),
        days: Number(intervalDays),
      })

      return fetcher(`${apiPrefix}${new URLSearchParams({ query })}`)
    },
    enabled: !!searchPath,
    refetchOnWindowFocus: false,
  })

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading} />

        {current.data && (
          <Grid>
            <Grid.Col span={4}>
              <PathsTable rows={current.data.rows} />
            </Grid.Col>
            <Grid.Col span={8}>
              <Box pos="relative">
                <Loading visible={searchQuery.isLoading} />
                <DisplayError error={searchQuery.error} />
                {searchQuery.data && <URLsTable rows={searchQuery.data.rows} />}
              </Box>
            </Grid.Col>
          </Grid>
        )}
      </Box>
      <Grid>
        <Grid.Col span={4}>
          <IntervalOptions value={intervalDays} onChange={setIntervalDays} />
        </Grid.Col>
        <Grid.Col span={4}>
          <RowsOptions value={rows} onChange={setRows} range={[10, 25, 100]} />
        </Grid.Col>
      </Grid>

      <DisplayError error={current.error} />
    </>
  )
}
function PathsTable({ rows }: { rows: QueryResultRow[] }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchPath = searchParams.get("searchPath")
  if (rows.length === 0) {
    return (
      <DisplayWarning warning="No data points">
        There are no data points left to display. ({rows.length} rows)
      </DisplayWarning>
    )
  }
  const numberFormat = new Intl.NumberFormat("en-US")

  return (
    <Table mb={30}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Path</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Count</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => {
          return (
            <Table.Tr
              key={row.path}
              style={
                row.path === searchPath ? { fontWeight: "bold" } : undefined
              }
            >
              <Table.Td
                onClick={() => {
                  if (row.path === searchPath) {
                    setSearchParams({ searchPath: "" })
                  } else {
                    setSearchParams({ searchPath: row.path as string })
                  }
                }}
              >
                {row.path}
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {numberFormat.format(row.count as number)}
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}

function URLsTable({ rows }: { rows: QueryResultRow[] }) {
  const clipboard = useClipboard({ timeout: 500 })
  const [clickedUrl, setClickedUrl] = useState("")

  useEffect(() => {
    if (clickedUrl) {
      clipboard.copy(clickedUrl)
      setClickedUrl("")
      notifications.show({
        message: "Copied to clipboard",
        color: "green",
      })
    }
  }, [clickedUrl, clipboard.copy])

  if (rows.length === 0) {
    return (
      <DisplayWarning warning="No data points">
        There are no data points left to display. ({rows.length} rows)
      </DisplayWarning>
    )
  }
  const numberFormat = new Intl.NumberFormat("en-US")

  return (
    <Table mb={30}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ textAlign: "right" }}>Count</Table.Th>
          <Table.Th>URL</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => {
          return (
            <Table.Tr key={row.url}>
              <Table.Td style={{ textAlign: "right" }}>
                {numberFormat.format(row.count as number)}
              </Table.Td>
              <Table.Td onClick={() => setClickedUrl(row.url as string)}>
                {row.url}
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}
