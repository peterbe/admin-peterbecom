import {
  ActionIcon,
  Box,
  Button,
  Code,
  Grid,
  SegmentedControl,
  Select,
  Switch,
  Table,
  Text,
} from "@mantine/core"
import { useClipboard } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { IconStethoscope } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import escapeString from "escape-sql-string"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import type { QueryResultRow } from "../types"
import { DisplayError, DisplayWarning } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { IntervalOptions } from "./interval-options"
import { Loading } from "./loading"
import { RowsOptions } from "./rows-options"
import { TruncateText } from "./truncate-text"
import { useInterval } from "./use-interval"
import { type QueryOptions, useSQLQuery } from "./use-query"
import { useRows } from "./use-rows"

const sqlQuery = ({
  select = "path",
  limit = 200,
  days = 30,
  back = 0,
  includeManifest = false,
} = {}) =>
  `
    SELECT ${select} AS key, SUM(count) AS count
    FROM requestlogrollupsquerystringdaily
    where
        ${createdRange(days, back, "day")}
        ${includeManifest ? "" : "AND path <> '/__manifest'"}
    GROUP BY 1
    ORDER BY 2 desc
    LIMIT ${Number(limit)}

`.trim()

const sqlSearchQuery = ({
  select = "path",
  limit = 200,
  days = 30,
  back = 0,
  includeManifest = false,
  search = "",
  filterBy = "",
} = {}) =>
  `
    SELECT ${select} AS key, SUM(count) AS count
    FROM requestlogrollupsquerystringdaily
    where
        ${createdRange(days, back, "day")}
        ${includeManifest ? "" : "AND path <> '/__manifest'"}
        AND ${filterBy} = ${escapeString(search)}
    GROUP BY 1
    ORDER BY 2 desc
    LIMIT ${Number(limit)}

`.trim()

const ID = "querystrings"

export function Querystrings() {
  return (
    <ChartContainer id={ID} title="Querystrings">
      <Inner />
    </ChartContainer>
  )
}

function Inner() {
  const [searchParams, setSearchParams] = useSearchParams()
  const includeManifest = searchParams.get("includeManifest") === "1"

  const select =
    searchParams.get("select") === "querystring" ? "querystring" : "path"

  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const [intervalDays, setIntervalDays] = useInterval(ID)
  const [rows, setRows] = useRows(ID, 10)
  const current = useQuery(
    sqlQuery({
      limit: Number(rows),
      days: Number(intervalDays),
      includeManifest,
      select,
    }),
  )

  const past = useQuery(
    sqlQuery({
      limit: Number(rows),
      days: Number(intervalDays) * 2,
      back: Number(intervalDays),
      includeManifest,
      select,
    }),
  )

  const searchValue = searchParams.get("qs:search")

  const search = useQuery(
    sqlSearchQuery({
      limit: Number(rows),
      days: Number(intervalDays),
      includeManifest,
      select: select === "querystring" ? "path" : "querystring",
      filterBy: select,
      search: searchValue || "", // hack to prevent the query from running when searchValue is null
    }),
    { enabled: Boolean(searchValue) },
  )
  //   console.log(
  //     sqlSearchQuery({
  //       limit: Number(rows),
  //       days: Number(intervalDays),
  //       includeManifest,
  //       select: select === "querystring" ? "path" : "querystring",
  //       filterBy: select,
  //       search: searchValue || "", // hack to prevent the query from running when searchValue is null
  //     }),
  //   )
  //   console.log("search", searchValue, search.data)

  //   const searchPath = searchParams.get("searchPath")
  //   const searchStatusCode = searchParams.get("searchStatusCode")
  //   const searchQuery = tsq_useQuery<QueryResult>({
  //     queryKey: ["search-query", ID, searchPath, searchStatusCode, only200s],
  //     queryFn: async () => {
  //       if (!searchPath) throw new Error("not selected")
  //       const query = sqlSearchQuery(searchPath, {
  //         limit: Number(rows),
  //         days: Number(intervalDays),
  //         statusCode: only200s ? "200" : searchStatusCode,
  //       })
  //       return fetcher(`${apiPrefix}${new URLSearchParams({ query })}`)
  //     },
  //     enabled: !!searchPath,
  //     refetchOnWindowFocus: false,
  //   })

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading || past.isLoading} />

        {current.data && past.data && !searchValue && (
          <PathsTable
            rows={current.data.rows}
            pastRows={past.data.rows}
            select={select}
            wide={true}
          />
        )}

        {current.data && searchValue && search.data && (
          <Grid>
            <Grid.Col span={6}>
              <PathsTable
                rows={current.data.rows}
                select={select}
                wide={false}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <PathsTable
                rows={search.data.rows}
                select={select === "querystring" ? "path" : "querystring"}
                wide={false}
              />
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
          <SegmentedControl
            value={select}
            onChange={(value: string) => {
              const sp = new URLSearchParams(searchParams)
              if (value === "querystring" || value === "path") {
                sp.set("select", value)
              }
              sp.delete("qs:search")
              setSearchParams(sp)
            }}
            withItemsBorders={false}
            transitionDuration={300}
            transitionTimingFunction="linear"
            data={[
              { label: "Path", value: "path" },
              { label: "Querystring", value: "querystring" },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={4}>
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
function PathsTable({
  rows,
  pastRows,
  select,
  wide,
}: {
  rows: QueryResultRow[]
  pastRows?: QueryResultRow[]
  select: "querystring" | "path"
  wide: boolean
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchValue = searchParams.get("qs:search")
  //   const searchPath = searchParams.get("searchPath")
  const asDict = pastRows
    ? Object.fromEntries(
        pastRows.map((row) => [row.key as string, row.count as number]),
      )
    : {}
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
          <Table.Th>
            {select === "querystring" ? "Querystring" : "Path"}
          </Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Count</Table.Th>
          {pastRows && (
            <Table.Th style={{ textAlign: "right" }}>Change</Table.Th>
          )}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => {
          return (
            <Table.Tr
              key={row.key as string}
              style={
                row.key === searchValue ? { fontWeight: "bold" } : undefined
              }
            >
              <Table.Td
                onClick={() => {
                  const sp = new URLSearchParams(searchParams)
                  if (row.key === searchValue) {
                    // setSearchParams({ searchPath: "" })
                    sp.delete("qs:search")
                  } else {
                    sp.set("qs:search", row.key as string)
                  }
                  setSearchParams(sp)
                }}
              >
                <TruncateText
                  size="sm"
                  text={row.key as string}
                  fw={row.key === searchValue ? 700 : undefined}
                  maxLength={wide ? 100 : 60}
                />
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {numberFormat.format(row.count as number)}
              </Table.Td>
              {pastRows && (
                <Table.Td style={{ textAlign: "right" }}>
                  {numberFormat.format(
                    ((asDict[row.key as string] || 0) -
                      (row.count as number)) as number,
                  )}
                </Table.Td>
              )}
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
function _URLsTable({ rows }: { rows: QueryResultRow[] }) {
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
  }, [clickedUrl, clipboard])

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
