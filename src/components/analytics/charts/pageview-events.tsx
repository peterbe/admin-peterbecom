import { Box, Grid, Table, Text } from "@mantine/core"

import type { QueryResultRow } from "../types"
import { ChartContainer } from "./container"
import { IntervalOptions } from "./interval-options"
import { Loading } from "./loading"
import { UrlFilterOptions } from "./options"
import { RowsOptions } from "./rows-options"
import { urlFilterToSQL } from "./url-filter-to-sql"
import { useInterval } from "./use-interval"
import { type QueryOptions, useSQLQuery } from "./use-query"
import { useRows } from "./use-rows"
import { useURLFilter } from "./use-url-filter"

export function PageviewEvents() {
  return (
    <ChartContainer id="pageview-events" title="Pageview Events">
      <Inner />
    </ChartContainer>
  )
}

const sqlQuery = (days = 7, limit = 10, urlFilter = "", previous = false) => `
SELECT
    url,
    count(url) AS count
FROM
    analytics
WHERE
    type='pageview'
    and ${
      previous
        ? `
      created > now() - interval '${days + days} days'
      and
      created < now() - interval '${days} days'
      `
        : `created > now() - interval '${days} days'`
    }
    ${urlFilterToSQL(urlFilter)}
GROUP BY
    url
ORDER BY 2 DESC
LIMIT ${Number(limit)}
`

function Inner() {
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: "pageview-events", ...options })

  const [intervalDays, setIntervalDays] = useInterval("pageview-events")
  const [rows, setRows] = useRows("pageview-events", 10)
  const [urlFilter, setURLField] = useURLFilter("pageview-events", "")

  const current = useQuery(
    sqlQuery(Number(intervalDays), Number(rows), urlFilter),
  )

  const previous = useQuery(
    sqlQuery(Number(intervalDays), Number(rows), urlFilter, true),
  )

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading} />

        {!current.error && current.data && (
          <EventsTable
            data={current.data.rows}
            previous={previous.data ? previous.data.rows : null}
          />
        )}
      </Box>

      <Grid>
        <Grid.Col span={4}>
          <IntervalOptions value={intervalDays} onChange={setIntervalDays} />
        </Grid.Col>
        <Grid.Col span={4}>
          <RowsOptions value={rows} onChange={setRows} range={[10, 25, 100]} />
        </Grid.Col>
        <Grid.Col span={4}>
          <UrlFilterOptions value={urlFilter} onChange={setURLField} />
        </Grid.Col>
      </Grid>
    </>
  )
}

function EventsTable({
  data,
  previous,
}: {
  data: QueryResultRow[]
  previous: QueryResultRow[] | null
}) {
  const previousEquivalent: Record<string, number> = {}
  if (previous) {
    for (const row of previous) {
      previousEquivalent[row.url as string] = row.count as number
    }
  }
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th> </Table.Th>
          <Table.Th>URL</Table.Th>
          <Table.Th>Count</Table.Th>
          <Table.Th>Delta</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((row, i) => {
          let delta = <i>n/a</i>
          const prev = previousEquivalent[row.url as string]
          if (prev !== undefined) {
            const diff = (row.count as number) - prev
            const sign = diff > 0 ? "+" : ""
            const pct = row.count === 0 ? 0 : (diff / prev) * 100
            delta = (
              <span style={{ color: diff > 0 ? "green" : "#f68787" }}>
                {sign}
                {diff.toLocaleString()} ({sign}
                {pct.toFixed(1)}%)
              </span>
            )
          }
          return (
            <Table.Tr key={row.url as string}>
              <Table.Td>
                <Text size="sm">{i + 1}</Text>
              </Table.Td>
              <Table.Td>{row.url as string}</Table.Td>
              <Table.Td>
                {new Intl.NumberFormat("en-US").format(row.count as number)}
              </Table.Td>
              <Table.Td>{delta}</Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}
