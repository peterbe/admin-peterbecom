import {
  ActionIcon,
  Box,
  CopyButton,
  Grid,
  SegmentedControl,
  Switch,
  Table,
  Tooltip,
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconCheck, IconCopy, IconStethoscope } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import type { QueryResultRow } from "../types"
import { DisplayError, DisplayWarning } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { IntervalOptions } from "./interval-options"
import { Loading } from "./loading"
import { QueriesTookInfo } from "./queries-took-info"
import { RowsOptions } from "./rows-options"
import { TruncateText } from "./truncate-text"
import { useInterval } from "./use-interval"
import { type QueryOptions, useSQLQuery } from "./use-query"
import { useRows } from "./use-rows"

function escapeSqlString(value: string): string {
  // Replace backslash \ with \\, then single quote ' with \'
  const escaped = value
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/'/g, "\\'") // Escape single quotes

  // Wrap in single quotes
  return `'${escaped}'`
}

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
        AND ${filterBy} = ${escapeSqlString(search)}
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
  const [includeManifest, setIncludeManifest] = useState(false)
  const [select, setSelect] = useState<"querystring" | "path">("path")

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

  const [searchValue, setSearchValue] = useState("")

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
            searchValue={searchValue}
            setSearchValue={(v: string | null) => {
              setSearchValue(v || "")
            }}
          />
        )}

        {current.data && searchValue && search.data && (
          <Grid>
            <Grid.Col span={6}>
              <PathsTable
                rows={current.data.rows}
                select={select}
                wide={false}
                searchValue={searchValue}
                setSearchValue={(v: string | null) => {
                  setSearchValue(v || "")
                }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <PathsTable
                rows={search.data.rows}
                select={select === "querystring" ? "path" : "querystring"}
                wide={false}
                probe
                searchValue={searchValue}
                setSearchValue={(v: string | null) => {
                  setSearchValue(v || "")
                }}
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
              if (value === "querystring" || value === "path") {
                setSelect(value)
              }
              setSearchValue("")
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
              setIncludeManifest(event.currentTarget.checked)
            }}
            label="Include /__manifest"
          />
        </Grid.Col>
      </Grid>

      <DisplayError error={current.error} />
      <QueriesTookInfo queries={[current, past, search]} />
    </>
  )
}

function PathsTable({
  rows,
  pastRows,
  select,
  wide,
  probe = false,
  searchValue,
  setSearchValue,
}: {
  rows: QueryResultRow[]
  pastRows?: QueryResultRow[]
  select: "querystring" | "path"
  wide: boolean
  probe?: boolean
  searchValue: string | null
  setSearchValue: (value: string | null) => void
}) {
  const asDict = pastRows
    ? Object.fromEntries(
        pastRows.map((row) => [row.key as string, row.count as number]),
      )
    : {}

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

  const { mutate } = useMutation({
    mutationKey: ["probe-url"],
    mutationFn: async (path: string) => {
      const probeBaseUrl =
        window.location.host === "localhost:4001" &&
        !import.meta.env.VITE_API_TARGET
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
          {probe && <Table.Th>Probe</Table.Th>}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => {
          let fullPath = ""
          if (select === "path") {
            fullPath = `${row.key}?${searchValue}`
          } else {
            fullPath = `${searchValue}?${row.key}`
          }

          return (
            <Table.Tr
              key={row.key as string}
              style={
                row.key === searchValue ? { fontWeight: "bold" } : undefined
              }
            >
              <Table.Td
                onClick={() => {
                  if (row.key === searchValue) {
                    setSearchValue(null)
                  } else {
                    setSearchValue(row.key as string)
                  }
                }}
                style={{ cursor: "pointer" }}
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
              {probe && (
                <Table.Td>
                  <ActionIcon
                    variant="default"
                    aria-label="Settings"
                    onClick={() => {
                      mutate(fullPath)
                    }}
                  >
                    <Tooltip label="Probe this URL" withArrow position="right">
                      <IconStethoscope size={16} />
                    </Tooltip>
                  </ActionIcon>{" "}
                  <CopyButton value={fullPath} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip
                        label={copied ? "Copied" : "Copy"}
                        withArrow
                        position="right"
                      >
                        <ActionIcon
                          color={copied ? "teal" : "gray"}
                          variant="default"
                          onClick={copy}
                        >
                          {copied ? (
                            <IconCheck size={16} />
                          ) : (
                            <IconCopy size={16} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Table.Td>
              )}
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}
