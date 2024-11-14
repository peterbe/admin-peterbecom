import { useQuery } from "@tanstack/react-query"
import { cdnPurgeURLsQueryKey, fetchCDNPurgeURLs } from "../api-utils"

export function usePurgeURLs<T>() {
  return useQuery<T>({
    queryKey: cdnPurgeURLsQueryKey(),
    queryFn: () => fetchCDNPurgeURLs(),
    refetchInterval: 3000,
  })
}
