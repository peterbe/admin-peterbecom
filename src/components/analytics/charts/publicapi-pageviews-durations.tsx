import { Box, SegmentedControl, SimpleGrid, Table, Text } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import type { QueryOptions } from "@tanstack/react-query"
import { useSearchParams } from "react-router"
import type { QueryResultRow } from "../types"
import { ChartContainer } from "./container"
import { IntervalOptions } from "./interval-options"
import { Loading } from "./loading"
import { QueriesTookInfo } from "./queries-took-info"
import { RowsOptions } from "./rows-options"
import { useInterval } from "./use-interval"
import { useSQLQuery } from "./use-query"
import { useRows } from "./use-rows"

const ID = "publicapi-pageviews-durations"
export function PublicAPIPageviewsDurations() {
  return (
    <ChartContainer id={ID} title="Public API Pageview Durations">
      <Inner id={ID} />
    </ChartContainer>
  )
}

const sqlQuery = (
  primaryKey: string,
  days = 7,
  limit = 10,
  orderBy = 4,
  reverse = false,
  minCount: number | null = null,
) => `
SELECT
    ${primaryKey === "url" ? "url AS url" : "meta->>'path' AS path"},
    count(*) AS count,
    SUM((data->>'duration')::real) AS sum,
    avg((data->>'duration')::real) AS avg
FROM
    analytics
WHERE
    type='publicapi-pageview'
    and created > now() - interval '${days} days'
GROUP BY
    ${primaryKey === "url" ? "url" : "meta->>'path'"}
${minCount ? `HAVING count(*) >= ${minCount}` : ""}
ORDER BY
    ${orderBy} ${reverse ? "asc" : "desc"}
LIMIT ${limit};
`

function Inner({ id }: { id: string }) {
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: id, ...options })

  const [rows, setRows] = useRows(id, 25)
  const [intervalDays, setIntervalDays] = useInterval(id)
  const [primaryKey, setPrimaryKey] = useLocalStorage({
    key: `analytics:primarykey:${id}`,
    defaultValue: "path",
  })
  const [minCount, setMinCount] = useLocalStorage({
    key: `analytics:mincount:${id}`,
    defaultValue: "1",
  })

  const [searchParams] = useSearchParams()
  const sortBy = searchParams.get(`${id}:sort`) || "sum"
  let orderBy = 4
  let reverse = false
  if (sortBy === "count" || sortBy === "-count") {
    orderBy = 2
    reverse = sortBy.startsWith("-")
  } else if (sortBy === "sum" || sortBy === "-sum") {
    orderBy = 3
    reverse = sortBy.startsWith("-")
  }
  if (sortBy === "avg" || sortBy === "-avg") {
    orderBy = 4
    reverse = sortBy.startsWith("-")
  }
  const current = useQuery(
    sqlQuery(
      primaryKey,
      Number(intervalDays),
      Number(rows),
      orderBy,
      reverse,
      Number(minCount),
    ),
  )

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading} />

        {!current.error && current.data && (
          <EventsTable id={id} data={current.data.rows} />
        )}
      </Box>

      <SimpleGrid cols={4} mb={20}>
        <RowsOptions value={rows} onChange={setRows} range={[10, 25, 100]} />

        <IntervalOptions
          value={intervalDays}
          onChange={setIntervalDays}
          range={[1, 3, 7]}
        />
        <SegmentedControl
          value={minCount}
          onChange={(x) => {
            setMinCount(x)
          }}
          withItemsBorders={false}
          data={[
            { label: "1", value: "1" },
            { label: "2", value: "2" },
            { label: "10", value: "10" },
            { label: "100", value: "100" },
            { label: "1,000", value: "1000" },
          ]}
        />
        <SegmentedControl
          value={primaryKey}
          onChange={(x) => {
            setPrimaryKey(x)
          }}
          withItemsBorders={false}
          transitionDuration={300}
          transitionTimingFunction="linear"
          data={[
            { label: "URL", value: "url" },
            { label: "Path", value: "path" },
          ]}
        />
      </SimpleGrid>

      <QueriesTookInfo queries={[current]} />
    </>
  )
}

function EventsTable({ id, data }: { id: string; data: QueryResultRow[] }) {
  const formatter = new Intl.NumberFormat("en-US")

  const [searchParams, setSearchParams] = useSearchParams()
  const sortKey = `${id}:sort`
  const sortBy = searchParams.get(sortKey) || "sum"
  type Sorts = "count" | "sum" | "avg"

  function changeSort(sort: Sorts) {
    const sp = new URLSearchParams(searchParams)
    if (sort === sortBy) {
      sp.set(sortKey, `-${sort}`)
    } else {
      sp.set(sortKey, sort)
    }
    setSearchParams(sp)
  }
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>URL</Table.Th>
          <Table.Th
            onClick={() => changeSort("count")}
            style={{ cursor: "pointer" }}
          >
            Count
          </Table.Th>
          <Table.Th
            onClick={() => changeSort("sum")}
            style={{ cursor: "pointer" }}
          >
            Sum
          </Table.Th>
          <Table.Th
            onClick={() => changeSort("avg")}
            style={{ cursor: "pointer" }}
          >
            Avg
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((row) => {
          return (
            <Table.Tr key={(row.url as string) || (row.path as string)}>
              <Table.Td>
                <Text size="sm">{row.url || row.path}</Text>
              </Table.Td>
              <Table.Td>{formatter.format(row.count as number)}</Table.Td>
              <Table.Td>{(row.sum as number).toFixed(2)}</Table.Td>
              <Table.Td>{(row.avg as number).toFixed(4)}</Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}
