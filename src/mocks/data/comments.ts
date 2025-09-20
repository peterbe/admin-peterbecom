import { HttpResponse } from "msw"
import type { CommentsServerData } from "../../components/comments/types"

import { getComments } from "./db"

export const COMMENTS = (params: URLSearchParams) => {
  const unapproved = params.get("unapproved")
  const autoapproved = params.get("autoapproved")
  const countOnly = params.get("count") === "true"

  const filtered = Object.values(getComments()).filter((item) => {
    if (unapproved === "only") {
      return !item.approved
    }
    if (autoapproved === "only") {
      return item.auto_approved
    }
    return true
  })
  const old = filtered.map((x) => x.add_date).sort()
  const oldest = old[0] as string

  const returned: CommentsServerData = {
    comments: countOnly ? [] : filtered,
    count: filtered.length,
    oldest,
  }
  return HttpResponse.json(returned)
}
