import {
  Box,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Table,
  Text,
} from "@mantine/core"
import type { QueryResultRow } from "../types"
import { DisplayError } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { Loading } from "./loading"
import { formatNumber } from "./number-format"
import classes from "./StatsGrid.module.css"
import { type QueryOptions, useSQLQuery } from "./use-query"

const ID = "user-agents"
export function UserAgents() {
  return (
    <ChartContainer id={ID} title="User Agents (in Pageviews)">
      <Inner />
    </ChartContainer>
  )
}

const sqlQuery = (
  field: string,
  days = 0,
  back = 0,
  {
    limit = 100,
    isBot = null,
  }: { limit?: number; isBot?: boolean | null } = {},
) => `
SELECT
    ${field} AS field, count(*) AS count
FROM
    analytics
WHERE
    type='pageview'
    and ${createdRange(days, back)}
    ${isBot !== null ? `and (data->>'is_bot')::BOOLEAN` : ""}
GROUP BY ${field}
ORDER BY 2 DESC
LIMIT ${limit}
`
const sqlQueryRequests = (
  field: string,
  days = 0,
  back = 0,
  { limit = 100 }: { limit?: number } = {},
) => `
SELECT
    ${field} AS field, count(*) AS count
FROM
    requestlog
WHERE
  ${createdRange(days, back)}
  and request->>'method' = 'GET'
GROUP BY ${field}
ORDER BY 2 DESC
LIMIT ${limit}
`

function Inner() {
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const isBots = useQuery(sqlQuery("data->>'is_bot'", 1))
  const isBotsPast = useQuery(sqlQuery("data->>'is_bot'", 2 + 7, 1 + 7))

  const isBotsRequests = useQuery(sqlQueryRequests("meta->>'isbot'", 1))
  const isBotsRequestsPast = useQuery(
    sqlQueryRequests("meta->>'isbot'", 2 + 7, 1 + 7),
  )

  const popularBotAgents = useQuery(
    sqlQuery("data->>'bot_agent'", 1, 0, { isBot: true }),
  )

  const popularBrowsers = useQuery(
    sqlQuery("meta->'user_agent'->>'browser'", 1),
  )
  const popularOSs = useQuery(sqlQuery("meta->'user_agent'->>'os'", 1))

  return (
    <Box pos="relative" mt={25} mb={50} style={{ minHeight: 260 }}>
      <Loading visible={isBots.isLoading && isBotsPast.isLoading} />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb={10}>
        {isBots.data && isBotsPast.data && (
          <GridItem
            value={getPercentTrue(isBots.data.rows)}
            title="Is Bot (pageviews)"
            note="Compared to a week ago"
            largeNumber={true}
            isFetching={isBots.isFetching || isBotsPast.isFetching}
            diffPercentage={
              getPercentTrue(isBotsPast.data.rows) > 0
                ? (100 * getPercentTrue(isBots.data.rows)) /
                    getPercentTrue(isBotsPast.data.rows) -
                  100
                : undefined
            }
            percentSF={1}
          />
        )}
        {isBotsRequests.data && isBotsRequestsPast.data && (
          <GridItem
            value={getPercentTrue(isBotsRequests.data.rows)}
            title="Is Bot (requests)"
            note="Compared to a week ago"
            largeNumber={true}
            isFetching={
              isBotsRequests.isFetching || isBotsRequestsPast.isFetching
            }
            diffPercentage={
              getPercentTrue(isBotsRequestsPast.data.rows) > 0
                ? (100 * getPercentTrue(isBotsRequests.data.rows)) /
                    getPercentTrue(isBotsRequestsPast.data.rows) -
                  100
                : undefined
            }
            percentSF={1}
          />
        )}
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb={10}>
        {popularBotAgents.data && (
          <MiniTable
            rows={lumpRest(popularBotAgents.data.rows, 5)}
            fieldTitle="Bot Agent"
            note="Last 24 hours"
            isFetching={popularBotAgents.isFetching}
          />
        )}
        {popularBrowsers.data && (
          <MiniTable
            rows={lumpRest(popularBrowsers.data.rows, 5)}
            fieldTitle="Browser"
            note="Last 24 hours"
            isFetching={popularBrowsers.isFetching}
          />
        )}
        {popularOSs.data && (
          <MiniTable
            rows={lumpRest(popularOSs.data.rows, 5)}
            fieldTitle="OS"
            note="Last 24 hours"
            isFetching={popularOSs.isFetching}
          />
        )}
      </SimpleGrid>

      <DisplayError error={isBots.error || isBotsPast.error} />
    </Box>
  )
}

function lumpRest(rows: QueryResultRow[], maxRows: number) {
  if (rows.length <= maxRows) {
    return rows
  }
  const rest = rows.slice(maxRows)
  const restCount = rest.reduce((sum, row) => sum + (row.count as number), 0)
  return [...rows.slice(0, maxRows), { field: "Rest", count: restCount }]
}

function getPercentTrue(rows: QueryResultRow[]) {
  let isTrue = 0
  let isFalse = 0
  for (const row of rows) {
    if (row.field === "true") {
      isTrue = row.count as number
    } else if (row.field === "false") {
      isFalse = row.count as number
    }
  }
  if (isTrue || isFalse) {
    return (isTrue / (isTrue + isFalse)) * 100
  }
  return 0
}

function GridItem({
  value,
  title,
  note,
  diffPercentage,
  isFetching,
  percentSF,
  largeNumber = false,
}: {
  value: number
  title: string
  note?: string
  diffPercentage?: number
  isFetching?: boolean
  percentSF?: number
  largeNumber?: boolean
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Text size="xs" c="dimmed" className={classes.title}>
        {title}
      </Text>
      <Group justify="center" gap="xs" mt={25}>
        <Text className={largeNumber ? classes.largeValue : classes.value}>
          {percentSF ? `${value.toFixed(percentSF)}%` : formatNumber(value)}
        </Text>
        {diffPercentage !== undefined && diffPercentage !== null && (
          <Text
            c={diffPercentage > 0 ? "teal" : "red"}
            // fz="sm"
            // fw={500}
            className={largeNumber ? classes.largeDiff : classes.diff}
          >
            <span>{diffPercentage.toFixed(1)}%</span>
          </Text>
        )}
      </Group>

      <SimpleGrid cols={2}>
        {note && (
          <Text fz="xs" c="dimmed" mt={7}>
            {note}
          </Text>
        )}
        {isFetching && (
          <Text ta="right">
            <Loader size={12} />
          </Text>
        )}
      </SimpleGrid>
    </Paper>
  )
}

function MiniTable({
  rows,
  fieldTitle,
  note,
  isFetching,
}: {
  rows: QueryResultRow[]
  fieldTitle: string
  note?: string
  isFetching?: boolean
}) {
  const totalCount = rows.reduce((sum, row) => sum + (row.count as number), 0)
  return (
    <Paper withBorder p="md" radius="md">
      <Table highlightOnHover withRowBorders={false}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{fieldTitle}</Table.Th>
            <Table.Th colSpan={2} style={{ textAlign: "right" }}>
              Count
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.field}>
              <Table.Td>{row.field}</Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <Text span c="dimmed" size="sm">
                  {(((row.count as number) / totalCount) * 100).toFixed(1)}%
                </Text>{" "}
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {formatNumber(row.count as number)}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <SimpleGrid cols={2}>
        {note && (
          <Text fz="xs" c="dimmed" mt={7}>
            {note}
          </Text>
        )}
        {isFetching && (
          <Text ta="right">
            <Loader size={12} />
          </Text>
        )}
      </SimpleGrid>
    </Paper>
  )
}
