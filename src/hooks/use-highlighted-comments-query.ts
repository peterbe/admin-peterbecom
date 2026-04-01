import { useQuery } from "@tanstack/react-query"
import {
  fetchHighlightedComments,
  highlightedCommentsQueryKey,
} from "../components/api-utils"

type CommentData = {
  id: number
  oid: string
  name: string
  email: string
  comment: string
  rendered: string
  add_date: string
  highlighted: string
  is_first: boolean
  page: number
  approved: boolean
}

type HighlightedComment = CommentData & {
  parent_id: null | number
  blogitem: {
    id: number
    oid: string
    title: string
    pub_date: string
  }
}

type ServerData = {
  comments: HighlightedComment[]
  count: number
}

export function useHighlightedCommentsQuery() {
  return useQuery<ServerData>({
    queryKey: highlightedCommentsQueryKey(),
    queryFn: fetchHighlightedComments,
  })
}
