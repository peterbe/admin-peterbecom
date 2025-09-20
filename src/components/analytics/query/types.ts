import type { QueryResult } from "../types"

export type PreviousQuery = {
  query: string
  created: string
  queryResult?: QueryResult
}
