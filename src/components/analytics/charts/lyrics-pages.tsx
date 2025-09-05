import { Box, Table } from "@mantine/core"
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
function Inner() {
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const current = useQuery(sqlQuery({ days: Number(30) }))
  const past = useQuery(
    sqlQuery({
      days: Number(30) * 2,
      back: Number(30),
    }),
  )

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading || past.isLoading} />

        {current.data && past.data && (
          <TableByPathname rows={current.data.rows} previous={past.data.rows} />
        )}
      </Box>

      <DisplayError error={current.error || past.error} />
    </>
  )
}

function TableByPathname({
  rows,
  previous,
}: {
  rows: QueryResultRow[]
  previous: QueryResultRow[]
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
  for (const row of previous) {
    const pathname = row.pathname as string
    const count = row.count as number
    const block = current.get(pathname)
    if (block) {
      block.previous = count
      block.increase = block.count - count
    }
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
          <Table.Th
            style={{ textAlign: "right" }}
            onClick={() => setSortBy("previous")}
          >
            Previous
          </Table.Th>
          <Table.Th
            style={{ textAlign: "right" }}
            onClick={() => setSortBy("increase")}
          >
            Delta
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {values.map((row) => {
          const percent = (100 * (row.count - row.previous)) / row.count

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
              <Table.Td style={{ textAlign: "right" }}>
                {row.previous.toLocaleString("en-US")}
              </Table.Td>
              <Table.Td
                style={{
                  textAlign: "right",
                  color:
                    row.increase > 0
                      ? "green"
                      : row.increase < 0
                        ? "red"
                        : undefined,
                }}
              >
                {row.increase.toLocaleString("en-US")}
                {` (${percent.toFixed(1)}%)`}
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}
