import { BarChart } from "@mantine/charts"
import {
  Box,
  Grid,
  Modal,
  SegmentedControl,
  Switch,
  Table,
  Text,
} from "@mantine/core"
import { differenceInHours } from "date-fns"
import { useState } from "react"
import type { QueryResultRow } from "../types"
import { DisplayError, DisplayWarning } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { IntervalOptions } from "./interval-options"
import { Loading } from "./loading"
import { QueriesTookInfo } from "./queries-took-info"
import { RowsOptions } from "./rows-options"
import { useInterval } from "./use-interval"
import { type QueryOptions, useSQLQuery } from "./use-query"
import { useRows } from "./use-rows"

const FILTER_STATUS_CODES = {
  all: "All",
  "200": "Only 200",
  "!200": "Anything but 200",
}
type FilterStatusCodes = keyof typeof FILTER_STATUS_CODES

const sqlQueryStatusCodeRollup = ({
  limit = 200,
  days = 30,
  back = 0,
} = {}) => `
SELECT bot_agent AS agent, status_code, SUM(count) as count
FROM requestlogrollupsbotagentstatuscodedaily
WHERE
    ${createdRange(days, back, "day")}
GROUP BY bot_agent, status_code
ORDER BY 3 DESC
LIMIT ${Number(limit)}
`

const sqlQueryRollup = ({
  limit = 200,
  days = 30,
  back = 0,
  filterStatusCodes = "all",
} = {}) => `
SELECT bot_agent AS agent, SUM(count) as count
FROM requestlogrollupsbotagentstatuscodedaily
WHERE
    ${createdRange(days, back, "day")}
    ${filterStatusCodes !== "all" ? (filterStatusCodes === "200" ? "AND status_code=200" : "AND status_code!=200") : ""}
GROUP BY bot_agent
ORDER BY 2 DESC
LIMIT ${Number(limit)}
`

const sqlQueryLatestDay = () => `
SELECT MAX(day) as day FROM requestlogrollupsbotagentstatuscodedaily
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

  const [filterStatusCodes, setFilterStatusCodes] =
    useState<FilterStatusCodes>("all")

  const current = useQuery(
    sqlQueryRollup({
      limit: Number(rows),
      days: Number(intervalDays),
      filterStatusCodes,
    }),
  )
  const past = useQuery(
    sqlQueryRollup({
      limit: Number(rows),
      days: Number(intervalDays) * 2,
      back: Number(intervalDays),
      filterStatusCodes,
    }),
  )

  const statusCodes = useQuery(
    sqlQueryStatusCodeRollup({
      limit: 300,
      days: Number(intervalDays),
    }),
  )

  const latestDay = useQuery(sqlQueryLatestDay())

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading || past.isLoading} />

        {current.data && past.data && statusCodes.data && (
          <AgentsTable
            rows={current.data.rows}
            previous={past.data.rows}
            statusCodes={statusCodes.data.rows}
            latestDay={latestDay.data?.rows[0].day as string}
          />
        )}
      </Box>
      <Grid mb={20}>
        <Grid.Col span={4}>
          <IntervalOptions
            value={intervalDays}
            onChange={setIntervalDays}
            range={[7, 28, 90]}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <RowsOptions value={rows} onChange={setRows} range={[10, 25, 100]} />
        </Grid.Col>
        <Grid.Col span={4}>
          <SegmentedControl
            value={filterStatusCodes}
            onChange={(v: string) => {
              if (v in FILTER_STATUS_CODES) {
                setFilterStatusCodes(v as FilterStatusCodes)
              }
            }}
            data={[
              { label: "All", value: "all" },
              { label: "Only 200", value: "200" },
              { label: "Anything but 200", value: "!200" },
            ]}
          />
        </Grid.Col>
      </Grid>

      <DisplayError error={current.error || past.error} />
      <QueriesTookInfo queries={[current, past]} />
    </>
  )
}

function AgentsTable({
  rows,
  previous,
  statusCodes,
  latestDay,
}: {
  rows: QueryResultRow[]
  previous: QueryResultRow[]
  statusCodes: QueryResultRow[]
  latestDay?: string
}) {
  type Entry = Record<string, number>
  const codes: Record<string, Entry> = {}
  for (const row of statusCodes) {
    const agent = row.agent as string
    const status_code = String(row.status_code)
    if (!(agent in codes)) {
      codes[agent] = {}
    }
    ;(codes[agent] as Entry)[status_code] = row.count as number
  }

  const [zoomedAgent, setZoomedAgent] = useState<string | null>(null)

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
    <div>
      <Modal
        opened={!!zoomedAgent}
        onClose={() => {
          setZoomedAgent(null)
        }}
        title={`Status codes for ${zoomedAgent}`}
        size="lg"
      >
        {zoomedAgent && zoomedAgent in codes && (
          <StatusCodesBarChart
            codes={codes[zoomedAgent] as Record<string, number>}
          />
        )}
      </Modal>

      <Table mb={30}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th onClick={() => changeSort("agent")}>Bot Agent</Table.Th>
            <Table.Th>Status codes</Table.Th>
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
                <Table.Td
                  onClick={() => {
                    setZoomedAgent(row.agent)
                  }}
                >
                  <StatusCodes codes={codes[row.agent]} />
                </Table.Td>
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
      {latestDay && (
        <Text size="xs" c="dimmed" ta="right">
          The data is rolled up as of{" "}
          <b>{differenceInHours(new Date(), new Date(latestDay))} hours ago</b>{" "}
          ({new Date(latestDay).toISOString()}). .
        </Text>
      )}
    </div>
  )
}

function StatusCodes({ codes }: { codes: Record<string, number> | undefined }) {
  if (!codes) return null

  const total = Object.values(codes).reduce((a, b) => a + b, 0)
  const flat = Object.entries(codes).sort((a, b) => b[1] - a[1])
  const parts: string[] = []
  for (const [code, count] of flat.slice(0, 3)) {
    parts.push(`${((100 * count) / total).toFixed(0)}% ${code}`)
  }
  return (
    <Text size="xs">
      {parts.map((part) => (
        <Text span key={part} style={{ marginRight: 15 }}>
          {part}
        </Text>
      ))}
    </Text>
  )
}

function StatusCodesBarChart({ codes }: { codes: Record<string, number> }) {
  const flat = Object.entries(codes).sort((a, b) => b[1] - a[1])
  const [excludeBiggest, setExcludeBiggest] = useState(false)

  // const colors = [
  //   "indigo.6",
  //   "yellow.6",
  //   "teal.6",
  //   "gray.6",
  //   "red.6",
  //   "blue.6",
  //   "green.6",
  //   "orange.6",
  //   "pink.6",
  //   "cyan.6",
  //   "lime.6",
  //   "violet.6",
  // ]
  // const data: {
  //   name: string
  //   value: number
  //   color: string
  // }[] = []
  const start = excludeBiggest ? 1 : 0

  type Entry = {
    code: string
    count: number
  }
  const barData: Entry[] = []
  for (let i = start; i < flat.length; i++) {
    const entry = flat[i] as [string, number]
    barData.push({
      code: entry[0],
      count: entry[1],
    })
  }

  const first = flat[0] as [string, number]

  return (
    <div>
      <BarChart
        h={500}
        data={barData}
        dataKey="code"
        series={[{ name: "count", color: "violet.6" }]}
      />
      <Box>
        <Switch
          checked={excludeBiggest}
          onChange={(event) => setExcludeBiggest(event.currentTarget.checked)}
          label={`Exclude biggest (${first[0]})`}
        />
      </Box>
    </div>
  )
}
