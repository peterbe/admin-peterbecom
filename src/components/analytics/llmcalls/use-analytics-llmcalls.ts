import { useQuery } from "@tanstack/react-query"
import { fetchAnalyticsLLMCalls } from "../../api-utils"

export type Aggregate = {
  month: string
  model: string
  count: number
  avg_took_seconds: number
  sum_took_seconds: number
  p50_took_seconds: number
  p90_took_seconds: number
  sum_input_tokens: null | number
  sum_output_tokens: null | number
}

export type ServerData = {
  aggregates: Aggregate[]
}

export function useAnalyticsLLMCalls({ useCases }: { useCases?: string[] }) {
  return useQuery<ServerData>({
    queryKey: ["analytics", "llmcalls", useCases],
    queryFn: fetchAnalyticsLLMCalls(useCases),
    enabled: !!useCases,
  })
}
