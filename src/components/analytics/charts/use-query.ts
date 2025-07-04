import { useQuery } from "@tanstack/react-query"
import type { QueryResult } from "../types"
import {
  apiPrefix,
  fetcher,
  notRefreshingFetchOptions,
  refreshingFetchOptions,
} from "./fetcher"

export type QueryOptions = {
  refresh?: boolean
  prefix?: string
  enabled?: boolean
}

export function useSQLQuery(
  query: string,
  { refresh = false, prefix = "", enabled = true }: QueryOptions = {},
) {
  return useQuery<QueryResult>({
    queryKey: ["use-query", prefix, query],
    queryFn: async () => {
      return fetcher(`${apiPrefix}${new URLSearchParams({ query })}`)
    },
    ...{ enabled: Boolean(enabled) },
    ...(refresh ? refreshingFetchOptions : notRefreshingFetchOptions),
  })
}
