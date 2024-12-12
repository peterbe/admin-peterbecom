import {
  commentsCountQueryKey,
  fetchCommentsCount,
  fetchWhoami,
  whoamiQueryKey,
} from "../components/api-utils"
import { queryClient } from "../query-client"

export async function loader() {
  return {
    whoami: queryClient.fetchQuery({
      queryKey: whoamiQueryKey(),
      queryFn: fetchWhoami,
      staleTime: 1000,
    }),
    countUnapprovedComments: queryClient.fetchQuery({
      queryKey: commentsCountQueryKey(),
      queryFn: fetchCommentsCount,
      staleTime: 5000,
    }),
  }
}
