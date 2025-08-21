import type { QueryResultRow } from "../types"

export function lumpRest(rows: QueryResultRow[], maxRows: number) {
  if (rows.length <= maxRows) {
    return rows
  }
  const rest = rows.slice(maxRows)
  const restCount = rest.reduce((sum, row) => sum + (row.count as number), 0)
  return [...rows.slice(0, maxRows), { field: "Rest", count: restCount }]
}
