import { useDocumentTitle } from "@mantine/hooks"
import type { QueryResult } from "../types"

export function useQueryDocumentTitle(
  error: Error | null,
  isPending: boolean,
  data: QueryResult | undefined,
) {
  let title = "Query"
  if (error) {
    title = "Error in query"
  } else if (isPending) {
    title = "Loading query..."
  } else if (data) {
    title = `${data.meta.count_rows.toLocaleString()} rows`
  }
  useDocumentTitle(title)
}
