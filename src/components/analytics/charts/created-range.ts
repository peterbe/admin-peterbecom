export function createdRange(days: number, back: number) {
  const ranges: string[] = []
  ranges.push(`created > NOW() - INTERVAL '${days} days'`)
  if (back) {
    ranges.push(`created < (NOW() - INTERVAL '${back} days')`)
  }
  return ranges.join(" and ")
}
