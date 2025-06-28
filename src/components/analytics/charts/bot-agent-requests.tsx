import { PieChart } from "@mantine/charts"
import { Box, Grid, Table } from "@mantine/core"
import { useState } from "react"
import type { QueryResultRow } from "../types"
import { DisplayError, DisplayWarning } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { IntervalOptions } from "./interval-options"
import { Loading } from "./loading"
import { RowsOptions } from "./rows-options"
import { useInterval } from "./use-interval"
import { type QueryOptions, useSQLQuery } from "./use-query"
import { useRows } from "./use-rows"

const sqlQuery = ({ limit = 200, days = 30, back = 0 } = {}) => `
SELECT meta->>'botAgent' AS agent, count(meta->>'botAgent')
FROM requestlog
WHERE
    ${createdRange(days, back)}
    AND (meta->'isbot')::BOOLEAN
    AND (meta->>'botAgent') IS NOT NULL
GROUP BY meta->>'botAgent'
ORDER BY 2 DESC
LIMIT ${Number(limit)}
`

const ID = "bot-agent-requests"

export function BotAgentRequests() {
  return (
    <ChartContainer id={ID} title="Bot Agent Requests">
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

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading || past.isLoading} />

        {current.data && past.data && (
          <Grid>
            <Grid.Col span={8}>
              <AgentsTable rows={current.data.rows} previous={past.data.rows} />
            </Grid.Col>
            <Grid.Col span={4}>
              <AgentsPie rows={current.data.rows} />
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

      <DisplayError error={current.error || past.error} />
    </>
  )
}
function AgentsPie({ rows }: { rows: QueryResultRow[] }) {
  if (rows.length === 0) {
    return (
      <DisplayWarning warning="No data points">
        There are no data points left to display. ({rows.length} rows)
      </DisplayWarning>
    )
  }

  const data: {
    name: string
    value: number
    color: string
  }[] = []
  const MAX_SEGMENTS = 8
  const colors = [
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
  ].reverse()
  if (colors.length < MAX_SEGMENTS) throw new Error("too few colors")

  let remaining = 0
  for (const row of rows.toSorted(
    (b, a) => (a.count as number) - (b.count as number),
  )) {
    if (data.length < MAX_SEGMENTS - 1) {
      const color = colors.shift()
      if (!color) continue
      data.push({
        name: row.agent as string,
        value: row.count as number,
        color,
      })
    } else {
      remaining += row.count as number
    }
  }
  if (remaining) {
    const color = colors.shift()
    if (color) {
      data.push({
        name: "Rest",
        value: remaining,
        color,
      })
    }
  }

  return (
    <div>
      <PieChart
        withLabelsLine
        labelsPosition="outside"
        labelsType="percent"
        withLabels
        withTooltip
        tooltipDataSource="segment"
        data={data}
        size={300}
      />
    </div>
  )
}

function AgentsTable({
  rows,
  previous,
}: {
  rows: QueryResultRow[]
  previous: QueryResultRow[]
}) {
  type Sorts = "percent" | "count" | "agent"
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
      const previous = hash.get(row.agent as string) || 0
      const delta = count - previous
      const percent = (100 * delta) / count
      return { agent: row.agent as string, count, previous, delta, percent }
    })
    .sort(
      (a, b) =>
        (sortReverse ? -1 : 1) *
        (sortBy === "agent"
          ? a.agent.localeCompare(b.agent)
          : b[sortBy] - a[sortBy]),
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
          <Table.Th onClick={() => changeSort("agent")}>Bot Agent</Table.Th>
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
            <Table.Tr key={row.agent}>
              <Table.Td>{row.agent}</Table.Td>
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
