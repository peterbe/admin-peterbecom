import { useQuery } from "@tanstack/react-query"

export type Aggregate = {
  month: string
  model: string
  count: number
  avg_took_seconds: number
  sum_took_seconds: number
}

export type ServerData = {
  aggregates: Aggregate[]
}

export function useAnalyticsLLMCalls() {
  return useQuery<ServerData>({
    queryKey: ["analytics", "llmcalls"],
    queryFn: async () => {
      const response = await fetch("/api/v0/analytics/llmcalls")
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
  })
}
