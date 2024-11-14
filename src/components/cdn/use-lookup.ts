import { useQuery } from "@tanstack/react-query"
import { cdnProbeQueryKey, fetchCDNProbe } from "../api-utils"
import type { ProbeServerData } from "./types"

export function useLookup(url: string) {
  return useQuery<ProbeServerData>({
    queryKey: cdnProbeQueryKey(url),
    queryFn: () => fetchCDNProbe(url),
  })
}
