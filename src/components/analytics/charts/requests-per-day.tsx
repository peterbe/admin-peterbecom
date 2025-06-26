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
SELECT date_trunc('day', created) AS day,
       COUNT(*) AS count
FROM requestlog
WHERE  ${createdRange(days, back)}
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
          <DisplayType id="bot-agent-requests" choices={["line", "table"]} />
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
  const data = [
    { date: "Jan", temperature: -25 },
    { date: "Feb", temperature: -10 },
    { date: "Mar", temperature: 5 },
    { date: "Apr", temperature: 15 },
    { date: "May", temperature: 30 },
    { date: "Jun", temperature: 15 },
    { date: "Jul", temperature: 30 },
    { date: "Aug", temperature: 40 },
    { date: "Sep", temperature: 15 },
    { date: "Oct", temperature: 20 },
    { date: "Nov", temperature: 0 },
    { date: "Dec", temperature: -10 },
  ]

  return (
    <LineChart
      h={300}
      data={data}
      series={[{ name: "temperature", label: "Avg. Temperature" }]}
      dataKey="date"
      type="gradient"
      gradientStops={[
        { offset: 0, color: "red.6" },
        { offset: 20, color: "orange.6" },
        { offset: 40, color: "yellow.5" },
        { offset: 70, color: "lime.5" },
        { offset: 80, color: "cyan.5" },
        { offset: 100, color: "blue.5" },
      ]}
      strokeWidth={5}
      curveType="natural"
      yAxisProps={{ domain: [-25, 40] }}
      valueFormatter={(value) => `${value}°C`}
    />
  )

  //   const data: {
  //     name: string
  //     value: number
  //     color: string
  //   }[] = []
  //   const MAX_SEGMENTS = 8
  //   const colors = [
  //     "#e6f7ff",
  //     "#d3eafb",
  //     "#a9d2f1",
  //     "#7bb9e9",
  //     "#56a4e1",
  //     "#3e97dd",
  //     "#2f90dc",
  //     "#1f7dc4",
  //     "#0f6fb0",
  //     "#00609d",
  //   ].reverse()
  //   if (colors.length < MAX_SEGMENTS) throw new Error("too few colors")

  //   let remaining = 0
  //   for (const row of rows.toSorted(
  //     (b, a) => (a.count as number) - (b.count as number),
  //   )) {
  //     if (data.length < MAX_SEGMENTS - 1) {
  //       const color = colors.shift()
  //       if (!color) continue
  //       data.push({
  //         name: row.agent as string,
  //         value: row.count as number,
  //         color,
  //       })
  //     } else {
  //       remaining += row.count as number
  //     }
  //   }
  //   if (remaining) {
  //     const color = colors.shift()
  //     if (color) {
  //       data.push({
  //         name: "Rest",
  //         value: remaining,
  //         color,
  //       })
  //     }
  //   }

  //   return (
  //     <div>
  //       <PieChart
  //         withLabelsLine
  //         labelsPosition="outside"
  //         labelsType="percent"
  //         withLabels
  //         withTooltip
  //         tooltipDataSource="segment"
  //         data={data}
  //         size={300}
  //       />
  //     </div>
  //   )
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

  const numberFormat = new Intl.NumberFormat("en-US")

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
              <Table.Td>{row.day}</Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {numberFormat.format(row.count)}
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
