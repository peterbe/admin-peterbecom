import { useQuery } from "@tanstack/react-query"
import { blogitemQueryKey, fetchBlogitem } from "../components/api-utils"
import type { EditBlogitemT } from "../types"

type ServerData = {
  blogitem?: EditBlogitemT
  notFound?: boolean
}

export function useBlogitem(oid: string | null) {
  return useQuery<ServerData>({
    queryKey: blogitemQueryKey(oid),
    queryFn: async () => {
      if (!oid) return null
      return fetchBlogitem(oid)
    },
    enabled: !!oid,
  })
}
