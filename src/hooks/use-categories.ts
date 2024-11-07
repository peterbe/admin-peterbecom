import { useQuery } from "@tanstack/react-query"
import { API_BASE } from "../config"
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
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/categories`)
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return await response.json()
    },
  })

  return { categories: data?.categories || [], error, isPending }
}
