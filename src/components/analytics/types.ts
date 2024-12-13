export interface User {
  id: number
  username: string
}

export type QueryMetaResult = {
  took_seconds: number
  count_rows: number
  maxed_rows: boolean
}

export type QueryResultRowValue = string | null | number

export type QueryResultRow = {
  [key: string]: QueryResultRowValue
}

export type QueryResult = {
  rows: QueryResultRow[]
  meta: QueryMetaResult
  error: string | null
}
