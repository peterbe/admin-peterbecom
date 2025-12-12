import { useEffect, useState } from "react"
import { queryClient } from "../../../query-client"

export function useRefreshContainer(): [string, (id: string) => void] {
  const [refresh, setRefresh] = useState("")

  useEffect(() => {
    if (refresh) {
      queryClient
        .invalidateQueries({
          queryKey: ["use-query", refresh],
        })
        .then(() => {})
        .catch(() => {})
    }
  }, [refresh])

  return [refresh, setRefresh]
}
