import { Box, Grid, Table } from "@mantine/core"

import { IntervalOptions } from "./interval-options"
import { BasicLineChart, type DataRow, type DataSerie } from "./line-chart"
import { Loading } from "./loading"
import { UrlFilterOptions } from "./options"
import { urlFilterToSQL } from "./url-filter-to-sql"
import { useInterval } from "./use-interval"
import { type QueryOptions, useSQLQuery } from "./use-query"
import { useURLFilter } from "./use-url-filter"
import { addDays } from "./utils"

const sqlQuery = (type: string, days = 7, urlFilter = "") => `
SELECT
    DATE_TRUNC('day', created) AS day,
    COUNT(url) AS count
FROM
    analytics
WHERE
    type='${type}'
    and created > now() - interval '${days + 1} days'
    and created < DATE_TRUNC('day', now())
    ${urlFilterToSQL(urlFilter)}
GROUP BY
    day
ORDER BY
    day;
`
const sqlQueryPrevious = (type: string, days = 7, urlFilter = "") => `
SELECT
    DATE_TRUNC('day', created) AS day,
    COUNT(url) AS count
FROM
    analytics
WHERE
    type='${type}'
    and created < now() - interval '${days + 1} days'
    and created > now() - interval '${days + days + 1} days'
    ${urlFilterToSQL(urlFilter)}
GROUP BY
    day
ORDER BY
    day;
`

export function CountByDay({
  id,
  type,
}: {
  id: string
  type: "pageview" | "publicapi-pageview"
}) {
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: id, ...options })

  const [intervalDays, setIntervalDays] = useInterval(id)
  const [urlFilter, setURLField] = useURLFilter(id, "")

  const current = useQuery(sqlQuery(type, Number(intervalDays), urlFilter))
  const previous = useQuery(
    sqlQueryPrevious(type, Number(intervalDays), urlFilter),
  )

  const dataX: DataRow[] = []
  const series: DataSerie[] = [{ name: "count", label: "Number" }]
  const dataO: Record<string, number> = {}
  const dataP: Record<string, number> = {}
  const keys: string[] = []
  if (current.data) {
    for (const row of current.data.rows) {
      const d = new Date(row.day as string)
      const k = `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}`
      dataO[k] = row.count as number
      keys.push(k)
    }
  }
  if (previous.data) {
    for (const row of previous.data.rows) {
      const d = addDays(new Date(row.day as string), Number(intervalDays))
      const k = `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}`
      dataP[k] = row.count as number
    }
    series.push({
      name: "countPrevious",
      label: "Previous period",
      strokeDasharray: "5 5",
    })
  }
  for (const k of keys) {
    const entry: {
      date: string
      count: number
      countPrevious?: number
    } = {
      date: k,
      count: dataO[k],
    }
    if (k in dataP) {
      entry.countPrevious = dataP[k]
    }
    dataX.push(entry)
  }

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading} />

        {!current.error && (
          <BasicLineChart data={dataX} series={series} dataKey="date" />
        )}
      </Box>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <IntervalOptions value={intervalDays} onChange={setIntervalDays} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <UrlFilterOptions value={urlFilter} onChange={setURLField} />
        </Grid.Col>
      </Grid>

      <DataRowTable data={dataX} />
    </>
  )
}

function DataRowTable({ data }: { data: DataRow[] }) {
  let sumDelta = <i>n/a</i>
  if (data.map((x) => x.countPrevious).every((x) => typeof x === "number")) {
    const sumPrevious = data
      .map((x) => x.countPrevious || 0)
      .reduce((x, a) => (x || 0) + (a || 0), 0)
    const sum = data.map((x) => x.count).reduce((x, a) => x + a, 0)
    const diff = sum - sumPrevious
    const sign = diff > 0 ? "+" : ""
    const pct = sumPrevious === 0 ? 0 : (diff / sumPrevious) * 100
    sumDelta = (
      <span style={{ color: diff > 0 ? "green" : "#f68787" }}>
        {sign}
        {diff.toLocaleString()} ({sign}
        {pct.toFixed(1)}%)
      </span>
    )
  }

  return (
    <Table mt={40} mb={20}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Count</Table.Th>
          <Table.Th>Previous period</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((row) => {
          let delta = <i>n/a</i>
          if (row.countPrevious) {
            const diff = row.count - row.countPrevious
            const sign = diff > 0 ? "+" : ""
            const pct =
              row.countPrevious === 0 ? 0 : (diff / row.countPrevious) * 100
            delta = (
              <span style={{ color: diff > 0 ? "green" : "#f68787" }}>
                {sign}
                {diff.toLocaleString()} ({sign}
                {pct.toFixed(1)}%)
              </span>
            )
          }
          return (
            <Table.Tr key={row.date}>
              <Table.Td>{row.date}</Table.Td>
              <Table.Td>{row.count.toLocaleString()}</Table.Td>
              <Table.Td>{delta}</Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
      <Table.Tfoot>
        <Table.Tr>
          <Table.Th>Sum total</Table.Th>
          <Table.Th>
            {data
              .map((x) => x.count)
              .reduce((partialSum, a) => partialSum + a, 0)
              .toLocaleString()}
          </Table.Th>
          <Table.Th>{sumDelta}</Table.Th>
        </Table.Tr>
      </Table.Tfoot>
    </Table>
  )
}
