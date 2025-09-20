import {
  ActionIcon,
  Box,
  Button,
  Code,
  Grid,
  Select,
  Switch,
  Table,
  Text,
} from "@mantine/core"
import { useClipboard } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { IconStethoscope } from "@tabler/icons-react"
import { useQuery as tsq_useQuery, useMutation } from "@tanstack/react-query"
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

const sqlQuery = ({
  limit = 200,
  days = 30,
  back = 0,
  only200s = false,
  includeManifest = false,
} = {}) => `
SELECT request->>'path' AS path, COUNT(*) AS count
FROM requestlog
where
    ${createdRange(days, back)}
    AND url != request->>'path'
    ${only200s ? "AND status_code = 200" : ""}
    ${includeManifest ? "" : "AND request->>'path' <> '/__manifest'"}
GROUP BY request->>'path'
ORDER BY 2 desc
LIMIT ${Number(limit)}
`

const sqlSearchQuery = (
  path: string,
  {
    limit = 200,
    days = 30,
    back = 0,
    statusCode = null,
  }: {
    limit?: number
    days?: number
    back?: number
    statusCode?: null | string
  } = {},
) => `
SELECT url, status_code, COUNT(*) AS count
FROM requestlog
where
    ${createdRange(days, back)}
    AND request->>'path' = ${escapeString(path)}
    ${statusCode === null ? "" : `AND status_code = ${escapeString(statusCode)}`}
GROUP BY url, status_code
ORDER BY 3 desc
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
  const [searchParams, setSearchParams] = useSearchParams()
  const only200s = searchParams.get("only200s") === "1"
  const includeManifest = searchParams.get("includeManifest") === "1"

  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const [intervalDays, setIntervalDays] = useInterval(ID)
  const [rows, setRows] = useRows(ID, 10)
  const current = useQuery(
    sqlQuery({
      limit: Number(rows),
      days: Number(intervalDays),
      only200s,
      includeManifest,
    }),
  )

  const searchPath = searchParams.get("searchPath")
  const searchStatusCode = searchParams.get("searchStatusCode")
  const searchQuery = tsq_useQuery<QueryResult>({
    queryKey: ["search-query", ID, searchPath, searchStatusCode, only200s],
    queryFn: async () => {
      if (!searchPath) throw new Error("not selected")
      const query = sqlSearchQuery(searchPath, {
        limit: Number(rows),
        days: Number(intervalDays),
        statusCode: only200s ? "200" : searchStatusCode,
      })
      return fetcher(`${apiPrefix}${new URLSearchParams({ query })}`)
    },
    enabled: !!searchPath,
    refetchOnWindowFocus: false,
  })

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading || searchQuery.isLoading} />

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
      <Grid mb={10}>
        <Grid.Col span={4}>
          <IntervalOptions value={intervalDays} onChange={setIntervalDays} />
        </Grid.Col>
        <Grid.Col span={4}>
          <RowsOptions value={rows} onChange={setRows} range={[10, 25, 100]} />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={4}>
          <Switch
            checked={only200s}
            onChange={(event) => {
              const sp = new URLSearchParams(searchParams)
              if (event.currentTarget.checked) {
                sp.set("only200s", "1")
              } else {
                sp.delete("only200s")
              }
              setSearchParams(sp)
            }}
            label="Only 200 OKs"
          />
        </Grid.Col>
        <Grid.Col span={4}>
          {/* <RowsOptions value={rows} onChange={setRows} range={[10, 25, 100]} /> */}
          <Switch
            checked={includeManifest}
            onChange={(event) => {
              const sp = new URLSearchParams(searchParams)
              if (event.currentTarget.checked) {
                sp.set("includeManifest", "1")
              } else {
                sp.delete("includeManifest")
              }
              setSearchParams(sp)
            }}
            label="Include /__manifest"
          />
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
                  const sp = new URLSearchParams(searchParams)
                  if (row.path === searchPath) {
                    setSearchParams({ searchPath: "" })
                    sp.delete("searchPath")
                  } else {
                    sp.set("searchPath", row.path as string)
                  }
                  setSearchParams(sp)
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

type ProbeURLResponse = {
  request: {
    url: string
    method: string
    user_agent: string
  }
  response: {
    status_code: number
    location?: string
    body?: string
  }
}
function URLsTable({ rows }: { rows: QueryResultRow[] }) {
  const clipboard = useClipboard({ timeout: 500 })
  const [clickedUrl, setClickedUrl] = useState("")

  const [searchParams, setSearchParams] = useSearchParams()
  const searchStatusCode = searchParams.get("searchStatusCode")

  const { mutate } = useMutation({
    mutationKey: ["probe-url"],
    mutationFn: async (path: string) => {
      const probeBaseUrl =
        window.location.host === "localhost:4001"
          ? "http://localhost:3000"
          : "https://www.peterbe.com"
      const url = `${probeBaseUrl}${path}`
      const response = await fetch("/api/v0/probe/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return (await response.json()) as ProbeURLResponse
    },
    onSuccess: (data) => {
      let message = `Status code: ${data.response.status_code}`
      if (data.response.location) {
        message += `\nLocation: ${data.response.location}`
      }
      notifications.show({
        title: "Probe response",
        message,
        autoClose: 10_000,
      })
    },
    onError: (err) => {
      notifications.show({
        title: "Probe failed",
        message: err.toString(),
        color: "red",
      })
    },
  })

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

  const counts = new Map<number, number>()
  let countAll = 0
  for (const row of rows) {
    const s = row.status_code as number
    counts.set(s, (counts.get(s) || 0) + 1)
    countAll++
  }

  type Entry = {
    label: string
    value: string
  }
  const rest: Entry[] = []
  for (const [statusCode, count] of counts.entries()) {
    rest.push({
      label: `${statusCode} (${numberFormat.format(count)})`,
      value: `${statusCode}`,
    })
  }
  rest.sort((a, b) => a.value.localeCompare(b.value))
  const statusCodeChoices = [
    {
      label: `ALL (${numberFormat.format(countAll)})`,
      value: "",
    },
    ...rest,
  ]
  return (
    <div>
      {rest.length === 1 && !searchStatusCode ? (
        <Text>
          They're all status_code
          <Code>{(rest[0] as Entry).value}</Code>
        </Text>
      ) : searchStatusCode ? (
        <Button
          onClick={() => {
            const sp = new URLSearchParams(searchParams)
            sp.delete("searchStatusCode")
            setSearchParams(sp)
          }}
        >
          reset
        </Button>
      ) : (
        <Select
          label="Status code"
          data={statusCodeChoices}
          value={searchStatusCode || ""}
          onChange={(statusCode) => {
            const sp = new URLSearchParams(searchParams)
            if (statusCode) {
              sp.set("searchStatusCode", statusCode)
            } else {
              sp.delete("searchStatusCode")
            }
            setSearchParams(sp)
          }}
        />
      )}
      <Table mb={30}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ textAlign: "right" }}>Count</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Probe</Table.Th>
            <Table.Th>URL</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => {
            const url = row.url as string
            const statusCode = row.status_code as number
            const key = `${url}${statusCode}`
            const count = row.count as number
            return (
              <Table.Tr key={key}>
                <Table.Td style={{ textAlign: "right" }}>
                  {numberFormat.format(count)}
                </Table.Td>
                <Table.Td>{statusCode}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="default"
                    aria-label="Settings"
                    onClick={() => {
                      mutate(row.url as string)
                    }}
                  >
                    <IconStethoscope
                      style={{ width: "70%", height: "70%" }}
                      stroke={1.5}
                    />
                  </ActionIcon>
                </Table.Td>
                <Table.Td onClick={() => setClickedUrl(url)}>
                  {row.url}
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </div>
  )
}
