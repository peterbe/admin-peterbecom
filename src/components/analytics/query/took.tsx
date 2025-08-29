export function Took({ seconds }: { seconds: number }) {
  if (seconds < 1) {
    return <span>{(seconds * 1000).toFixed(1)} milliseconds</span>
  }
  return <span>{seconds.toFixed(2)} seconds (🦥 🐢 🐌 pretty slow!)</span>
}
