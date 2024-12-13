import { useQuery as tanstack_useQuery } from "@tanstack/react-query"

import type { QueryResult } from "../types"
import {
  apiPrefix,
  fetcher,
  notRefreshingFetchOptions,
  refreshingFetchOptions,
} from "./fetcher"

type QueryOptions = {
  refresh?: boolean
}

export function useQuery(
  query: string,
  { refresh = false }: QueryOptions = {},
) {
  return tanstack_useQuery<QueryResult>({
    queryKey: ["use-query", query],
    queryFn: async () => {
      return fetcher(`${apiPrefix}${new URLSearchParams({ query })}`)
    },
    ...(refresh ? refreshingFetchOptions : notRefreshingFetchOptions),
  })
}
