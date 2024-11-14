import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cdnProbeQueryKey, fetchCDNPurge } from "../api-utils"

export function usePurge(url: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ["cdn", "purge", ...url],
    mutationFn: async (urls: string[]) => fetchCDNPurge(urls),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cdnProbeQueryKey(url) })
    },
  })
}
