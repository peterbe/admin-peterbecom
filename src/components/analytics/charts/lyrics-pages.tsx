import { Sparkline } from "@mantine/charts"
import { Box, Table, Text } from "@mantine/core"
import { useState } from "react"
import type { QueryResultRow } from "../types"
import { DisplayError } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { Loading } from "./loading"
import { type QueryOptions, useSQLQuery } from "./use-query"

const sqlQuery = ({ limit = 1000, days = 30, back = 0 } = {}) =>
  `
SELECT
    pathname,
    SUM(count) AS count
FROM
    analyticsrollupspathnamedaily
WHERE
    ${createdRange(days, back, "day")}
    AND type='pageview'
    AND (
           pathname='/plog/blogitem-040601-1'
        OR pathname like '/plog/blogitem-040601-1/p%'
    )
GROUP BY
    pathname
ORDER BY 1 desc
LIMIT ${Number(limit)}
`.trim()

const sqlQueryTrend = ({ months = 4 } = {}) =>
  `
SELECT
    DATE_TRUNC('month', day) AS trunc,
    pathname,
    SUM(count) AS count
FROM
    analyticsrollupspathnamedaily
WHERE
    day > now() - interval '${months} months'
    AND type='pageview'
    AND (
           pathname='/plog/blogitem-040601-1'
        OR pathname like '/plog/blogitem-040601-1/p%'
    )
GROUP BY
    pathname, trunc
ORDER BY pathname, trunc, count desc
`.trim()

const TITLES: Record<number, string> = {
  1: "I'm looking for a song that goes like this lyrics. Song lyrics search finder.",
  2: "I'm looking for this song by these lyrics.",
  3: "I'm looking for a song I don't know the name of.",
  4: "Looking for a song you heard, but don't know the name?",
  5: "Looking for a song you heard, but don't know the name?",
  6: "Trying to find a song but only know a few words.",
  7: "Anyone know this song by these lyrics?",
  8: "I'm looking for this song by these lyrics.",
  9: "Trying to find the name of the song.",
  10: "Looking for the name of the song by the lyrics.",
  11: "Help me find the name of the song by lyrics.",
  12: "I'm looking for a song that goes...",
  13: "I don't know the song, but I know some lyrics.",
}

const DEFAULT_TITLE = "Look for a song by its lyrics."

const ID = "lyrics-pages"

export function LyricsPages() {
  return (
    <ChartContainer id={ID} title="Lyrics Pages">
      <Inner />
    </ChartContainer>
  )
}

const TREND_MONTHS = 4

function Inner() {
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const trend = useQuery(sqlQueryTrend({ months: TREND_MONTHS }))

  const current = useQuery(sqlQuery({ days: Number(30) }))

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading || trend.isLoading} />

        {current.data && trend.data && (
          <TableByPathname rows={current.data.rows} trend={trend.data.rows} />
        )}
      </Box>

      <DisplayError error={current.error || trend.error} />
    </>
  )
}

function TableByPathname({
  rows,
  trend,
}: {
  rows: QueryResultRow[]
  trend: QueryResultRow[]
}) {
  type Data = {
    pathname: string
    count: number
    previous: number
    increase: number
  }
  const current = new Map<string, Data>()
  for (const row of rows) {
    const pathname = row.pathname as string
    const count = row.count as number
    current.set(pathname, { pathname, count, previous: 0, increase: 0 })
  }

  type SortKeys = keyof Data
  const [sortBy, setSortBy] = useState<SortKeys>("count")
  const values = Array.from(current.values()).sort((a, b) => {
    if (sortBy === "pathname") {
      const aNum = Number(a.pathname.split("-1/p")[1] || "1")
      if (Number.isNaN(aNum)) return 1
      const bNum = Number(b.pathname.split("-1/p")[1] || "1")
      if (Number.isNaN(bNum)) return 1

      return aNum - bNum
    }
    return b[sortBy] - a[sortBy]
  })
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th onClick={() => setSortBy("pathname")}>Pathname</Table.Th>
          <Table.Th>Title</Table.Th>
          <Table.Th
            style={{ textAlign: "right" }}
            onClick={() => setSortBy("count")}
          >
            Count
          </Table.Th>
          <Table.Th>Trend ({TREND_MONTHS} months)</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {values.map((row) => {
          const num = Number(row.pathname.split("-1/p")[1] || "1")
          let title = DEFAULT_TITLE
          if (TITLES[num]) {
            title = TITLES[num]
          }

          return (
            <Table.Tr key={row.pathname}>
              <Table.Td style={{ fontWeight: "bold" }}>
                {row.pathname.replace("/plog/blogitem-040601-1", "") || "/"}
              </Table.Td>
              <Table.Td>
                <small>
                  <i>{title}</i>
                </small>
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {row.count.toLocaleString("en-US")}
              </Table.Td>

              <Table.Td>
                <TrendLine rows={trend} pathname={row.pathname} />
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}

function TrendLine({
  rows,
  pathname,
}: {
  rows: QueryResultRow[]
  pathname: string
}) {
  const points = rows
    .filter((r) => r.pathname === pathname)
    .map((row) => row.count as number)

  if (!points.length) {
    return null
  }
  const sumPoints = points.reduce((a, b) => a + b, 0)
  if (sumPoints < 100) {
    return <Text size="xs">too little data</Text>
  }

  return (
    <Sparkline
      w={150}
      h={30}
      data={points}
      trendColors={{ positive: "teal.6", negative: "red.6", neutral: "gray.5" }}
      fillOpacity={0.2}
      strokeWidth={1.0}
    />
  )
}
