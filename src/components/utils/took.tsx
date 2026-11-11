export function Took({
  seconds,
  compact = false,
}: {
  seconds: number
  compact?: boolean
}) {
  if (seconds < 1) {
    return (
      <span>
        {(seconds * 1000).toFixed(compact ? 1 : 2)}
        {compact ? "ms" : " milliseconds"}
      </span>
    )
  }
  return (
    <span>
      {seconds.toFixed(1)}
      {compact ? "s" : " seconds"}
    </span>
  )
}
