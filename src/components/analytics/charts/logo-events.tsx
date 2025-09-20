import { Box, SimpleGrid } from "@mantine/core"
import { DisplayError } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { Loading } from "./loading"
import { lumpRest } from "./lump-rest"
import { MiniTable } from "./minitable"
import { type QueryOptions, useSQLQuery } from "./use-query"

const ID = "logo-events"
export function LogoEvents() {
  return (
    <ChartContainer id={ID} title="Logo Events">
      <Inner />
    </ChartContainer>
  )
}

const sqlQueryRequests = (
  field: string,
  days = 0,
  back = 0,
  { limit = 100 }: { limit?: number } = {},
) => `
SELECT
    ${field} AS field, count(*) AS count
FROM
    analytics
WHERE
    type='logo'
    AND ${createdRange(days, back)}
GROUP BY ${field}
ORDER BY 2 DESC
LIMIT ${limit}
`

function Inner() {
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const byRefWeek = useQuery(sqlQueryRequests("data->>'ref'", 7))
  const byRefMonth = useQuery(sqlQueryRequests("data->>'ref'", 30))

  return (
    <Box pos="relative" mt={25} mb={50} style={{ minHeight: 260 }}>
      <Loading visible={byRefWeek.isLoading || byRefMonth.isLoading} />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb={10}>
        {byRefWeek.data && (
          <MiniTable
            rows={lumpRest(byRefWeek.data.rows, 5)}
            fieldTitle="By Ref"
            note="Last 7 days"
            isFetching={byRefWeek.isFetching}
            withTotal
          />
        )}

        {byRefMonth.data && (
          <MiniTable
            rows={lumpRest(byRefMonth.data.rows, 5)}
            fieldTitle="By Ref"
            note="Last 30 days"
            isFetching={byRefMonth.isFetching}
            withTotal
          />
        )}
      </SimpleGrid>

      <DisplayError error={byRefWeek.error || byRefMonth.error} />
    </Box>
  )
}
