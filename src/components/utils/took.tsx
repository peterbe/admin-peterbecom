export function Took({ seconds }: { seconds: number }) {
  if (seconds < 1) {
    return <span>{(seconds * 1000).toFixed(2)} milliseconds</span>
  }
  return <span>{seconds.toFixed(1)} seconds</span>
}
