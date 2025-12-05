import { Text } from "@mantine/core"

import type { UseQueryResult } from "@tanstack/react-query"
import { Took } from "../query/took"
import type { QueryResult } from "../types"

type Props = {
  queries: UseQueryResult<QueryResult, Error>[]
}
export function QueriesTookInfo({ queries }: Props) {
  let sumTotalSeconds = 0.0
  let countQueries = 0
  for (const q of queries) {
    if (!q.isEnabled) {
      continue
    }
    if (!q.data) {
      return null
    }
    sumTotalSeconds += q.data.meta.took_seconds
    countQueries++
  }
  return (
    <Text size="xs" c="dimmed">
      {countQueries} {countQueries === 1 ? "query" : "queries"} took{" "}
      <Took seconds={sumTotalSeconds} />
    </Text>
  )
}
