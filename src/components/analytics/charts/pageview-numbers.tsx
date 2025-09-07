import { Box, Group, Loader, Paper, SimpleGrid, Text } from "@mantine/core"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { Loading } from "./loading"
import { formatNumber } from "./number-format"
import classes from "./StatsGrid.module.css"
import { type QueryOptions, useSQLQuery } from "./use-query"

const ID = "pageview-numbers"
export function PageviewNumbers() {
  return (
    <ChartContainer id={ID} title="Pageview Numbers">
      <Inner />
    </ChartContainer>
  )
}

// const _sqlQuery = (days = 0, back = 0) => `
// SELECT
//     count(url) AS count
// FROM
//     analytics
// WHERE
//     type='pageview'
//     and ${createdRange(days, back)}
// `
const sqlQueryUnion = (
  days: number,
  back: number,
  days2: number,
  back2: number,
) =>
  `
SELECT
    count(url) AS count
FROM
    analytics
WHERE
    type='pageview'
    and ${createdRange(days, back)}
UNION
SELECT
    count(url) AS count
FROM
    analytics
WHERE
    type='pageview'
    and ${createdRange(days2, back2)}
`.trim()

const sqlQueryRollup = (days = 0, back = 0) =>
  `
SELECT
    SUM(count) AS count
FROM
    analyticsrollupsdaily
WHERE
    type='pageview'
    and ${createdRange(days, back, "day")}
`.trim()

const sqlQueryRollupUnion = (days = 0, back = 0, days2 = 0, back2 = 0) =>
  `
SELECT
    SUM(count) AS count
FROM
    analyticsrollupsdaily
WHERE
    type='pageview'
    and ${createdRange(days, back, "day")}
UNION
SELECT
    SUM(count) AS count
FROM
    analyticsrollupsdaily
WHERE
    type='pageview'
    and ${createdRange(days2, back2, "day")}

`.trim()

const sqlQueryUsers = (days = 0, back = 0) =>
  `
SELECT
    COUNT(DISTINCT meta->'sid') as sessions,
    COUNT(DISTINCT meta->'uuid') as users
FROM analytics
WHERE
  type='pageview'
  and ${createdRange(days, back)}
`.trim()

function Inner() {
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const oldestPageviewCreated = useQuery(`
    select min(created) from analytics where type='pageview' `)
  const oldestCreated = oldestPageviewCreated.data?.rows[0]?.min || new Date()
  const oldestDays = Math.floor(
    (Date.now() - new Date(oldestCreated).getTime()) / (1000 * 60 * 60 * 24),
  )

  const today = useQuery(sqlQueryUnion(1, 0, 2, 1), { refresh: true })

  const thisWeek0 = useQuery(sqlQueryRollup(7 + 1, 1))
  const lastWeek = useQuery(sqlQueryRollup(14 + 1, 7 + 1))
  const thisWeek = useQuery(sqlQueryRollupUnion(7 + 1, 1, 14 + 1, 7 + 1))
  console.log(sqlQueryRollupUnion(7 + 1, 1, 14 + 1, 7 + 1))
  console.log("OLD", thisWeek0.data?.rows, lastWeek.data?.rows)
  console.log("NEW", thisWeek.data?.rows)

  const thisMonth = useQuery(sqlQueryRollup(28 + 1, 1))
  const lastMonth = useQuery(sqlQueryRollup(28 * 2 + 1, 28 + 1))

  const usersToday = useQuery(sqlQueryUsers(1), { refresh: true })
  const usersYesterday = useQuery(sqlQueryUsers(2, 1))

  return (
    <Box pos="relative" mt={25} mb={50} style={{ minHeight: 260 }}>
      <Loading visible={today.isLoading} />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb={10}>
        {today.data && (
          <GridItem
            value={today.data.rows[0]?.count as number}
            title="Pageviews today"
            note="Last 24 hours"
            isFetching={today.isFetching}
            diffPercentage={
              (100 * (today.data.rows[0]?.count as number)) /
                (today.data.rows[1]?.count as number) -
              100
            }
          />
        )}
        {thisWeek.data && (
          <GridItem
            value={thisWeek.data.rows[0]?.count as number}
            title="Pageviews this week"
            note="Last 7 days"
            isFetching={thisWeek.isFetching}
            diffPercentage={
              (100 * (thisWeek.data.rows[0]?.count as number)) /
                (thisWeek.data.rows[1]?.count as number) -
              100
            }
          />
        )}
        {thisMonth.data && lastMonth.data && (
          <GridItem
            value={thisMonth.data.rows[0]?.count as number}
            title="Pageviews this month"
            note="Last 28 days"
            isFetching={thisMonth.isFetching}
            diffPercentage={
              lastMonth.data.rows[0]?.count && oldestDays > 28 * 2
                ? (100 * (thisMonth.data.rows[0]?.count as number)) /
                    (lastMonth.data.rows[0]?.count as number) -
                  100
                : undefined
            }
          />
        )}
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
        {usersToday.data && usersYesterday.data && (
          <GridItem
            value={usersToday.data.rows[0]?.users as number}
            title="Users today"
            note="Last 24 hours"
            isFetching={usersToday.isFetching || usersYesterday.isFetching}
            diffPercentage={
              (100 * (usersToday.data.rows[0]?.users as number)) /
                (usersYesterday.data.rows[0]?.users as number) -
              100
            }
          />
        )}
        {usersToday.data && usersYesterday.data && (
          <GridItem
            value={usersToday.data.rows[0]?.sessions as number}
            title="Sessions today"
            note="Last 24 hours"
            isFetching={usersToday.isFetching || usersYesterday.isFetching}
            diffPercentage={
              (100 * (usersToday.data.rows[0]?.sessions as number)) /
                (usersYesterday.data.rows[0]?.sessions as number) -
              100
            }
          />
        )}
      </SimpleGrid>
    </Box>
  )
}

function GridItem({
  value,
  title,
  note,
  diffPercentage,
  isFetching,
}: {
  value: number
  title: string
  note?: string
  diffPercentage?: number
  isFetching?: boolean
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Text size="xs" c="dimmed" className={classes.title}>
        {title}
      </Text>
      <Group align="flex-end" gap="xs" mt={25}>
        <Text className={classes.value}>{formatNumber(value)}</Text>
        {diffPercentage !== undefined && diffPercentage !== null && (
          <Text
            c={diffPercentage > 0 ? "teal" : "red"}
            fz="sm"
            fw={500}
            className={classes.diff}
          >
            <span>{diffPercentage.toFixed(1)}%</span>
            {/* <DiffIcon size="1rem" stroke={1.5} /> */}
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
