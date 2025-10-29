import { Box, Table } from "@mantine/core"
import type { QueryResultRow } from "../types"
import { DisplayError } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { Loading } from "./loading"
import { QueriesTookInfo } from "./queries-took-info"
import { type QueryOptions, useSQLQuery } from "./use-query"

const sqlQuery = ({ limit = 100, days = 30, back = 0 } = {}) =>
  `
SELECT
    referrer = '' AS has_referrer,
    is_bot,
    SUM(count) AS count
FROM analyticsrollupcommentsreferrerdaily
WHERE
    ${createdRange(days, back, "day")}
GROUP BY referrer = '', is_bot
ORDER BY 3 desc
LIMIT ${Number(limit)}
`.trim()

const ID = "comments-by-referral"

export function CommentsByReferral() {
  return (
    <ChartContainer id={ID} title="Comments by Referral">
      <Inner />
    </ChartContainer>
  )
}

function Inner() {
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const current = useQuery(sqlQuery({ days: Number(30) }))

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading} />

        {current.data && <TableByGroups rows={current.data.rows} />}
      </Box>

      <DisplayError error={current.error} />
      <QueriesTookInfo queries={[current]} />
    </>
  )
}

function TableByGroups({ rows }: { rows: QueryResultRow[] }) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Has Referrer</Table.Th>
          <Table.Th>Is Bot?</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Count</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => {
          return (
            <Table.Tr key={`${row.has_referrer}-${row.is_bot}`}>
              <Table.Td>{row.has_referrer ? "Yes" : "No"}</Table.Td>
              <Table.Td>{row.is_bot ? "Yes" : "No"}</Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {(row.count as number).toLocaleString("en-US")}
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}
