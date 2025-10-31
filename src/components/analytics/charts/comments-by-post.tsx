import { Box, Grid, Table } from "@mantine/core"
import type { QueryResultRow } from "../types"
import { DisplayError } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { IntervalOptions } from "./interval-options"
import { Loading } from "./loading"
import { QueriesTookInfo } from "./queries-took-info"
import { RowsOptions } from "./rows-options"
import { useInterval } from "./use-interval"
import { type QueryOptions, useSQLQuery } from "./use-query"
import { useRows } from "./use-rows"

const sqlQuery = ({ limit = 100, days = 30, back = 0 } = {}) =>
  `
SELECT
    split_part(pathname, '/', 3) AS post,
    is_bot,
    SUM(count) AS count
FROM analyticsrollupcommentsreferrerdaily
WHERE
    ${createdRange(days, back, "day")}
    AND split_part(pathname, '/', 3) != ''
GROUP BY 1, 2
ORDER BY 3 desc
LIMIT ${Number(limit)}
`.trim()

const ID = "comments-by-post"

export function CommentsByPost() {
  return (
    <ChartContainer id={ID} title="Comments by Post">
      <Inner />
    </ChartContainer>
  )
}

function Inner() {
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const [rows, setRows] = useRows(ID, 25)
  const [intervalDays, setIntervalDays] = useInterval(ID)

  const current = useQuery(
    sqlQuery({ days: Number(intervalDays), limit: Number(rows) }),
  )

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading} />

        {current.data && <TableByGroups rows={current.data.rows} />}
      </Box>

      <Grid mb={20}>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <RowsOptions value={rows} onChange={setRows} range={[10, 25, 100]} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <IntervalOptions
            value={intervalDays}
            onChange={setIntervalDays}
            range={[3, 7, 28]}
          />
        </Grid.Col>
      </Grid>

      <DisplayError error={current.error} />
      <QueriesTookInfo queries={[current]} />
    </>
  )
}

function TableByGroups({ rows }: { rows: QueryResultRow[] }) {
  const flat: {
    post: string
    is_bot: number
    is_not_bot: number
    combined: number
  }[] = []
  const map = new Map<
    string,
    {
      is_bot: number
      is_not_bot: number
    }
  >()

  for (const row of rows) {
    const post = row.post as string
    const before = map.get(post) || { is_bot: 0, is_not_bot: 0 }
    if (row.is_bot) {
      map.set(post, {
        is_bot: before.is_bot + (row.count as number),
        is_not_bot: before.is_not_bot,
      })
    } else {
      map.set(post, {
        is_bot: before.is_bot,
        is_not_bot: before.is_not_bot + (row.count as number),
      })
    }
  }
  for (const [post, counts] of map.entries()) {
    flat.push({
      post,
      is_bot: counts.is_bot,
      is_not_bot: counts.is_not_bot,
      combined: counts.is_bot + counts.is_not_bot,
    })
  }
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Post</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Bot</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Not bot</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Combined</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {flat.map((row) => {
          return (
            <Table.Tr key={row.post}>
              <Table.Td>
                <a
                  href={`https://www.peterbe.com/plog/${row.post}`}
                  target="_blank"
                >
                  {row.post}
                </a>
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {row.is_bot.toLocaleString("en-US")}
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {row.is_not_bot.toLocaleString("en-US")}
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {row.combined.toLocaleString("en-US")}
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}
