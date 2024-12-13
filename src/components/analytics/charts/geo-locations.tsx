import { PieChart } from "@mantine/charts"
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

export function GeoLocations() {
  return (
    <ChartContainer id="geo-locations" title="Geo Locations">
      <Inner />
    </ChartContainer>
  )
}

const sqlQuery = ({ limit = 200, days = 30 } = {}) => `
SELECT city, country, COUNT(*)
FROM analytics_geo
WHERE
    city IS NOT NULL
    AND country is not null
    AND created > NOW() - INTERVAL '${days} days'
GROUP BY city, country
ORDER BY 3 DESC
LIMIT ${Number(limit)}
`

const sqlQueryCountries = ({ limit = 200, days = 30 } = {}) => `
SELECT country, COUNT(*)
FROM analytics_geo
WHERE
    country IS NOT NULL
    AND created > NOW() - INTERVAL '${days} days'
GROUP BY country
ORDER BY 2 DESC
LIMIT ${Number(limit)}
`

function Inner() {
  const [intervalDays, setIntervalDays] = useInterval("geo-locations")
  const [rows, setRows] = useRows("geo-locations", 10)

  const current = useQuery(
    sqlQuery({ limit: Number(rows), days: Number(intervalDays) }),
  )

  const countries = useQuery(
    sqlQueryCountries({ limit: Number(rows), days: Number(intervalDays) }),
  )

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading} />

        {!current.error && current.data && (
          <CitiesTable rows={current.data.rows} />
        )}
        {!countries.error && countries.data && (
          <CountriesPieChart rows={countries.data.rows} />
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

      <DisplayError error={current.error || countries.error} />
    </>
  )
}

function CitiesTable({ rows }: { rows: QueryResultRow[] }) {
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
            <Table.Th>Country</Table.Th>
            <Table.Th>Count</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row, i) => {
            return (
              <Table.Tr key={`${row.city}${row.country}${i}`}>
                <Table.Td>{row.city}</Table.Td>
                <Table.Td>{row.country}</Table.Td>
                <Table.Td>{row.count}</Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </>
  )
}

function CountriesPieChart({ rows }: { rows: QueryResultRow[] }) {
  const data: {
    name: string
    value: number
    color: string
  }[] = []
  const colors = ["blue", "grape", "cyan", "teal", "indigo", "red", "orange"]
  function nextColor() {
    return colors.shift() || "gray"
  }
  let rest = 0
  for (const row of rows) {
    if (data.length < 6) {
      data.push({
        name: row.country as string,
        value: row.count as number,
        color: nextColor(),
      })
    } else {
      rest += row.count as number
    }
  }
  if (rest) {
    data.push({
      name: "rest",
      value: rest,
      color: nextColor(),
    })
  }

  return (
    <Box>
      <PieChart
        withLabelsLine
        labelsPosition="inside"
        labelsType="value"
        withLabels
        withTooltip
        size={300}
        strokeWidth={2}
        valueFormatter={(value) => new Intl.NumberFormat("en-US").format(value)}
        data={data}
      />
    </Box>
  )
}
