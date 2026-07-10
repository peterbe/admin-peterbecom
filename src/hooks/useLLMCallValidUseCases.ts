import { useQuery } from "@tanstack/react-query"
import { fetchValidLLMCallUseCases } from "../components/api-utils"

export type UseCase = {
  use_case: string
  count: number
}
type ServerData = {
  use_cases: UseCase[]
}

export function useLLMCallValidUseCases() {
  return useQuery<ServerData>({
    queryKey: ["llm-call-valid-use-cases"],
    queryFn: fetchValidLLMCallUseCases(),
  })
}
