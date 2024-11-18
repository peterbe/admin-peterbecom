import {
  commentsCountQueryKey,
  fetchCommentsCount,
} from "../components/api-utils"
import { queryClient } from "../query-client"

export type RootLoaderData = {
  countUnapprovedComments: number
}

export async function loader() {
  return {
    countUnapprovedComments: queryClient.fetchQuery({
      queryKey: commentsCountQueryKey(),
      queryFn: fetchCommentsCount,
      staleTime: 5000,
    }),
  }
}
