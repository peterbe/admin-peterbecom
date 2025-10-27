import { Text } from "@mantine/core"

import type { UseQueryResult } from "@tanstack/react-query"
import { Took } from "../query/took"
import type { QueryResult } from "../types"

type Props = {
  queries: UseQueryResult<QueryResult, Error>[]
}
export function QueriesTookInfo({ queries }: Props) {
  let sumTotalSeconds = 0.0
  for (const q of queries) {
    if (!q.data) {
      return null
    }
    sumTotalSeconds += q.data.meta.took_seconds
  }
  return (
    <Text size="xs" c="dimmed">
      {queries.length} {queries.length === 1 ? "query" : "queries"} took{" "}
      <Took seconds={sumTotalSeconds} />
    </Text>
  )
}
