import { useQuery } from "@tanstack/react-query"
import { commentsQueryKey, fetchComments } from "../api-utils"
import type { CommentsServerData } from "./types"

export function useCommentsQuery(searchParams: URLSearchParams) {
  return useQuery<CommentsServerData>({
    queryKey: commentsQueryKey(searchParams),
    queryFn: () => fetchComments(searchParams),
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000,
  })
}
