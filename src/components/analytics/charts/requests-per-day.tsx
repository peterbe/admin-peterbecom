import { LineChart } from "@mantine/charts"
import { Box, Grid, Table } from "@mantine/core"
import { useState } from "react"
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

const sqlQuery = ({ limit = 200, days = 30, back = 0 } = {}) => `
  SELECT
    date_trunc('day', created) AS day,
    COUNT(*) AS count
  FROM requestlog
  WHERE ${createdRange(days, back)}
  GROUP BY 1
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
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const [intervalDays, setIntervalDays] = useInterval(ID)
  const [rows, setRows] = useRows(ID, 10)
  const current = useQuery(
    sqlQuery({ limit: Number(rows), days: Number(intervalDays) }),
  )
  const past = useQuery(
    sqlQuery({
      limit: Number(rows),
      days: Number(intervalDays) * 2,
      back: Number(intervalDays),
    }),
  )

  const [displayType] = useDisplayType(ID)

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading || past.isLoading} />

        {current.data &&
          past.data &&
          (displayType === "line" ? (
            <RequestsLine rows={current.data.rows} />
          ) : (
            <RequestsTable rows={current.data.rows} previous={past.data.rows} />
          ))}
      </Box>
      <Grid>
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

      <DisplayError error={current.error || past.error} />
    </>
  )
}

function RequestsLine({ rows }: { rows: QueryResultRow[] }) {
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
}: {
  rows: QueryResultRow[]
  previous: QueryResultRow[]
}) {
  type Sorts = "percent" | "count" | "day"
  const [sortBy, setSortBy] = useState<Sorts>("percent")
  const [sortReverse, setSortReverse] = useState(false)
  const hash = new Map<string, number>(
    previous.map((row) => {
      return [row.agent as string, row.count as number]
    }),
  )
  const combined = rows
    .map((row) => {
      const count = row.count as number
      const previous = hash.get(row.day as string) || 0
      const delta = count - previous
      const percent = (100 * delta) / count
      return { day: row.day as string, count, previous, delta, percent }
    })
    .sort(
      (a, b) =>
        (sortReverse ? -1 : 1) *
        (sortBy === "day" ? a.day.localeCompare(b.day) : b[sortBy] - a[sortBy]),
    )

  const numberFormatter = new Intl.NumberFormat("en-US")
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
  })

  function changeSort(sort: Sorts) {
    if (sort === sortBy) {
      setSortReverse((prev) => !prev)
    } else {
      setSortBy(sort)
      setSortReverse(false)
    }
  }

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
          <Table.Th onClick={() => changeSort("day")}>Day</Table.Th>
          <Table.Th
            style={{ textAlign: "right" }}
            onClick={() => changeSort("count")}
          >
            Count
          </Table.Th>
          <Table.Th
            style={{ textAlign: "right" }}
            onClick={() => changeSort("percent")}
          >
            Increase
          </Table.Th>
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
