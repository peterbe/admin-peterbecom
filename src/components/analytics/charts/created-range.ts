export function createdRange(days: number, back: number, field = "created") {
  const ranges: string[] = []
  ranges.push(`${field} > NOW() - INTERVAL '${days} days'`)
  if (back) {
    ranges.push(`${field} < (NOW() - INTERVAL '${back} days')`)
  }
  return ranges.join(" AND ")
}
