import { Box, Grid, Table } from "@mantine/core"
import type { QueryResultRow } from "../types"
import { DisplayError, DisplayWarning } from "./alerts"
import { ChartContainer } from "./container"
import { IntervalOptions } from "./interval-options"
import { Loading } from "./loading"
import { RowsOptions } from "./rows-options"
import { useInterval } from "./use-interval"
import { useQuery } from "./use-query"
import { useRows } from "./use-rows"

const sqlQuery = ({ limit = 200, days = 30 } = {}) => `
SELECT meta->'botAgent' AS agent, count(meta->'botAgent')
FROM requestlog
WHERE
    created > NOW() - INTERVAL '${Number(days)} days'
    AND (meta->'isbot')::BOOLEAN
    AND meta->'botAgent' IS NOT NULL
GROUP BY meta->'botAgent'
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
  const [intervalDays, setIntervalDays] = useInterval("bot-agent-requests")
  const [rows, setRows] = useRows("bot-agent-requests", 10)
  const current = useQuery(
    sqlQuery({ limit: Number(rows), days: Number(intervalDays) }),
  )
  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading} />

        {current.data && <AgentsTable rows={current.data.rows} />}
        {/* {!countries.error && countries.data && (
          <CountriesPieChart rows={countries.data.rows} />
        )} */}
      </Box>
      <Grid>
        <Grid.Col span={6}>
          <IntervalOptions value={intervalDays} onChange={setIntervalDays} />
        </Grid.Col>
        <Grid.Col span={6}>
          <RowsOptions value={rows} onChange={setRows} range={[10, 25, 100]} />
        </Grid.Col>
      </Grid>

      {/* <DisplayError error={current.error || countries.error} /> */}
      <DisplayError error={current.error} />
    </>
  )
}

function AgentsTable({ rows }: { rows: QueryResultRow[] }) {
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
            <Table.Th>City</Table.Th>
            <Table.Th>Count</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => {
            return (
              <Table.Tr key={row.agent}>
                <Table.Td>{row.agent}</Table.Td>
                <Table.Td>{row.count}</Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </>
  )
}
