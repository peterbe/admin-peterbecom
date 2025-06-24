import { useState } from "react"

export function useRefreshContainer(): [string, (id: string) => void] {
  const [refresh, setRefresh] = useState("")
  return [refresh, setRefresh]
}
