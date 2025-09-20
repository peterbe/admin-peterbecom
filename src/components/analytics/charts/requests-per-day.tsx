import { LineChart } from "@mantine/charts"
import { Box, Grid, Switch, Table, Text } from "@mantine/core"
import { useSearchParams } from "react-router"
import type { QueryResultRow } from "../types"
import { DisplayError, DisplayWarning } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { DisplayType } from "./display-type"
import { IntervalOptions } from "./interval-options"
import { Loading } from "./loading"
import { RowsOptions } from "./rows-options"
import { useDisplayType } from "./use-display-type"
import { useInterval } from "./use-interval"
import { type QueryOptions, useSQLQuery } from "./use-query"
import { useRows } from "./use-rows"
import { addDays } from "./utils"

const sqlQuery = ({
  limit = 200,
  days = 30,
  back = 0,
  excludePosts = false,
  exclude200 = false,
} = {}) => `
  SELECT
    date_trunc('day', created) AS day,
    COUNT(*) AS count
  FROM requestlog
  WHERE ${createdRange(days, back)}
  ${excludePosts ? "AND request->>'method' <> 'POST'" : ""}
   ${exclude200 ? "AND status_code <> 200" : ""}
  GROUP BY 1
  ORDER BY 1 DESC
  LIMIT ${Number(limit)}
`

const sqlQueryByStatus = ({
  limit = 200,
  days = 30,
  back = 0,
  excludePosts = false,
  exclude200 = false,
} = {}) => `
  SELECT
    date_trunc('day', created) AS day, status_code,
    COUNT(*) AS count
  FROM requestlog
  WHERE ${createdRange(days, back)}
  ${excludePosts ? "AND request->>'method' <> 'POST'" : ""}
  ${exclude200 ? "AND status_code <> 200" : ""}
  GROUP BY 1, 2
  ORDER BY 1 DESC
  LIMIT ${Number(limit)}
`

const ID = "requests-per-day"

export function RequestsPerDay() {
  return (
    <ChartContainer id={ID} title="Requests per day">
      <Inner />
    </ChartContainer>
  )
}
function Inner() {
  const [searchParams, setSearchParams] = useSearchParams()
  const splitByStatus = searchParams.get("splitByStatus") === "1"
  const excludePosts = searchParams.get("excludePosts") === "1"
  const exclude200 = searchParams.get("exclude200") === "1"

  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const [intervalDays, setIntervalDays] = useInterval(ID)
  const [rows, setRows] = useRows(ID, 10)
  const current = useQuery(
    splitByStatus
      ? sqlQueryByStatus({
          limit: Number(rows) * 6,
          days: Number(intervalDays),
          excludePosts,
          exclude200,
        })
      : sqlQuery({
          limit: Number(rows),
          days: Number(intervalDays),
          excludePosts,
          exclude200,
        }),
  )
  const past = useQuery(
    sqlQuery({
      limit: Number(rows),
      days: Number(intervalDays) * 2,
      back: Number(intervalDays),
      excludePosts,
      exclude200,
    }),
    { enabled: !splitByStatus },
  )

  const [displayType] = useDisplayType(ID)

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading || past.isLoading} />

        {current.data && displayType === "line" && (
          <RequestsLine
            rows={current.data.rows}
            splitByStatus={splitByStatus}
          />
        )}
        {current.data &&
          past.data &&
          displayType === "table" &&
          !splitByStatus && (
            <RequestsTable
              rows={current.data.rows}
              previous={past.data.rows}
              intervalDays={Number(intervalDays)}
            />
          )}
        {current.data && displayType === "table" && splitByStatus && (
          <RequestsByStatusTable rows={current.data.rows} />
        )}
      </Box>
      <Grid mb={10}>
        <Grid.Col span={4}>
          <IntervalOptions value={intervalDays} onChange={setIntervalDays} />
        </Grid.Col>
        <Grid.Col span={4}>
          <RowsOptions value={rows} onChange={setRows} range={[10, 25, 100]} />
        </Grid.Col>
        <Grid.Col span={4}>
          <DisplayType id={ID} choices={["line", "table"]} />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={4}>
          <Switch
            checked={splitByStatus}
            onChange={(event) => {
              const sp = new URLSearchParams(searchParams)
              if (event.currentTarget.checked) {
                sp.set("splitByStatus", "1")
              } else {
                sp.delete("splitByStatus")
              }
              setSearchParams(sp)
            }}
            label="Split by status codes"
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Switch
            checked={excludePosts}
            onChange={(event) => {
              const sp = new URLSearchParams(searchParams)
              if (event.currentTarget.checked) {
                sp.set("excludePosts", "1")
              } else {
                sp.delete("excludePosts")
              }
              setSearchParams(sp)
            }}
            label="Exclude POST requests"
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Switch
            checked={exclude200}
            onChange={(event) => {
              const sp = new URLSearchParams(searchParams)
              if (event.currentTarget.checked) {
                sp.set("exclude200", "1")
              } else {
                sp.delete("exclude200")
              }
              setSearchParams(sp)
            }}
            label="Exclude 200 OK"
          />
        </Grid.Col>
      </Grid>

      <DisplayError error={current.error || past.error} />
    </>
  )
}

function RequestsLine({
  rows,
  splitByStatus,
}: {
  rows: QueryResultRow[]
  splitByStatus: boolean
}) {
  if (rows.length === 0) {
    return (
      <DisplayWarning warning="No data points">
        There are no data points left to display. ({rows.length} rows)
      </DisplayWarning>
    )
  }
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  })

  if (splitByStatus) {
    const grouped: Record<string, Record<string, number>> = {}
    const series = new Set<string>()
    for (const row of rows) {
      const dayDate = row.day as string
      if (!(dayDate in grouped)) {
        grouped[dayDate] = {}
      }
      if (dayDate in grouped) {
        ;(grouped[dayDate] as Record<string, number>)[`${row.status_code}`] =
          row.count as number
        series.add(`${row.status_code}`)
      }
    }
    const data: Record<string, string | number>[] = []
    for (const [dateString, numbers] of Object.entries(grouped)) {
      data.push({
        day: formatter.format(new Date(dateString)),
        ...numbers,
      })
    }
    data.reverse()
    const colors = [
      "red.6",
      "orange.6",
      "yellow.5",
      "lime.5",
      "cyan.5",
      "blue.5",
      "#e6f7ff",
      "#d3eafb",
      "#a9d2f1",
      "#7bb9e9",
      "#56a4e1",
      "#3e97dd",
      "#2f90dc",
      "#1f7dc4",
      "#0f6fb0",
      "#00609d",
    ]
    return (
      <LineChart
        h={400}
        data={data}
        dataKey="day"
        series={[...series].map((statusCode) => {
          const nextColor = colors.shift()
          return { name: statusCode, color: nextColor || "indigo.5" }
        })}
        curveType="natural"
      />
    )
  }

  const data: {
    day: string
    requests: number
  }[] = []

  for (const row of rows) {
    const dayDate = new Date(row.day as string)
    data.unshift({
      day: formatter.format(dayDate),
      requests: row.count as number,
    })
  }

  return (
    <LineChart
      h={400}
      data={data}
      series={[{ name: "requests", label: "Requests" }]}
      dataKey="day"
      type="gradient"
      gradientStops={[
        { offset: 0, color: "red.6" },
        { offset: 20, color: "orange.6" },
        { offset: 40, color: "yellow.5" },
        { offset: 70, color: "lime.5" },
        { offset: 80, color: "cyan.5" },
        { offset: 100, color: "blue.5" },
      ]}
      strokeWidth={3}
      curveType="natural"
      tooltipAnimationDuration={200}
      yAxisProps={{
        tickFormatter: (value) => {
          if (value > 1_000) {
            return `${new Intl.NumberFormat("en-US").format(value / 1000)}k`
          }
          return new Intl.NumberFormat("en-US").format(value)
        },
      }}
      valueFormatter={(value) => new Intl.NumberFormat("en-US").format(value)}
    />
  )
}

function RequestsTable({
  rows,
  previous,
  intervalDays,
}: {
  rows: QueryResultRow[]
  previous: QueryResultRow[]
  intervalDays: number
}) {
  const hash = new Map<string, number>(
    previous.map((row) => {
      const d = addDays(new Date(row.day as string), intervalDays)
      const k = `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}`
      return [k, row.count as number]
    }),
  )
  const combined = rows.map((row) => {
    const count = row.count as number
    const d = new Date(row.day as string)
    const k = `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}`
    const previous = hash.get(k) || 0
    const delta = count - previous
    const percent = (100 * delta) / count
    return { day: row.day as string, count, previous, delta, percent }
  })

  const numberFormatter = new Intl.NumberFormat("en-US")
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
  })

  if (rows.length === 0) {
    return (
      <DisplayWarning warning="No data points">
        There are no data points left to display. ({rows.length} rows)
      </DisplayWarning>
    )
  }

  return (
    <Table mb={30}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Day</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Count</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Increase</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {combined.map((row) => {
          return (
            <Table.Tr key={row.day}>
              <Table.Td>{dayFormatter.format(new Date(row.day))}</Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {numberFormatter.format(row.count)}
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <span style={{ color: row.delta > 0 ? "green" : "red" }}>
                  {row.percent.toFixed(0)}%
                </span>
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}

function RequestsByStatusTable({ rows }: { rows: QueryResultRow[] }) {
  if (rows.length === 0) {
    return (
      <DisplayWarning warning="No data points">
        There are no data points left to display. ({rows.length} rows)
      </DisplayWarning>
    )
  }
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  })
  const numberFormatter = new Intl.NumberFormat("en-US")
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
  })
  const grouped: Record<string, Record<string, number>> = {}
  for (const row of rows) {
    const dayDate = row.day as string
    if (!(dayDate in grouped)) {
      grouped[dayDate] = {}
    }
    if (dayDate in grouped) {
      ;(grouped[dayDate] as Record<string, number>)[`${row.status_code}`] =
        row.count as number
    }
  }
  type Entry = Record<string, string | number>
  const data: Entry[] = []
  for (const [dateString, numbers] of Object.entries(grouped)) {
    data.push({
      day: formatter.format(new Date(dateString)),
      ...numbers,
    })
  }
  const statusCodes = Object.keys(data[0] as Entry).filter((x) => x !== "day")

  return (
    <Table mb={30}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Day</Table.Th>
          {statusCodes.map((statusCode) => {
            return (
              <Table.Th key={statusCode} style={{ textAlign: "right" }}>
                {statusCode}
              </Table.Th>
            )
          })}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((row) => {
          const total = Object.entries(row)
            .filter(([key]) => key !== "day")
            .map(([, v]) => v)
            .reduce((v, acc) => (acc as number) + (v as number), 0) as number
          if (!row.day) throw new Error("row.day is missing")
          return (
            <Table.Tr key={row.day}>
              <Table.Td>{dayFormatter.format(new Date(row.day))}</Table.Td>
              {statusCodes.map((statusCode) => {
                const count = (row[statusCode] || 0) as number
                const percent = (100 * count) / total
                return (
                  <Table.Td key={statusCode} style={{ textAlign: "right" }}>
                    <Text c="dimmed" size="sm" span>
                      {percent.toFixed(0)}%
                    </Text>{" "}
                    {numberFormatter.format(count)}
                  </Table.Td>
                )
              })}
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}
