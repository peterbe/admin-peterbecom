import { useQuery } from "@tanstack/react-query"
import { categoriesQueryKey, fetchCategories } from "../components/api-utils"
import type { CategoryT } from "../types"

type ServerData = {
  categories: {
    id: number
    name: string
    count: number
  }[]
}

export function useCategories(): {
  categories: CategoryT[]
  error: Error | null
  isPending: boolean
} {
  const { data, error, isPending } = useQuery<ServerData>({
    queryKey: categoriesQueryKey(),
    queryFn: fetchCategories,
  })

  return { categories: data?.categories || [], error, isPending }
}
