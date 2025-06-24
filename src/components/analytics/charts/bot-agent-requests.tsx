import { Box, Grid, Table } from "@mantine/core"
import { useContext, useEffect, useState } from "react"
import type { QueryResultRow } from "../types"
import { DisplayError, DisplayWarning } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { IntervalOptions } from "./interval-options"
import { Loading } from "./loading"
import { RefreshContainerContext } from "./refresh-context"
import { RowsOptions } from "./rows-options"
import { useInterval } from "./use-interval"
import { useQuery } from "./use-query"
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

export function BotAgentRequests() {
  return (
    <ChartContainer id="bot-agent-requests" title="Bot Agent Requests">
      <Inner />
    </ChartContainer>
  )
}
function Inner() {
  const { refresh } = useContext(RefreshContainerContext)

  const [intervalDays, setIntervalDays] = useInterval("bot-agent-requests")
  const [rows, setRows] = useRows("bot-agent-requests", 10)
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

  useEffect(() => {
    if (refresh === "bot-agent-requests") {
      current.refetch()
      past.refetch()
    }
  }, [refresh, current.refetch, past.refetch])

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading || past.isLoading} />

        {current.data && past.data && (
          <AgentsTable rows={current.data.rows} previous={past.data.rows} />
        )}
      </Box>
      <Grid>
        <Grid.Col span={6}>
          <IntervalOptions value={intervalDays} onChange={setIntervalDays} />
        </Grid.Col>
        <Grid.Col span={6}>
          <RowsOptions value={rows} onChange={setRows} range={[10, 25, 100]} />
        </Grid.Col>
      </Grid>

      <DisplayError error={current.error || past.error} />
    </>
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

  return (
    <>
      {!rows.length && (
        <DisplayWarning warning="No data points">
          There are no data points left to display. ({rows.length} rows)
        </DisplayWarning>
      )}

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
    </>
  )
}
