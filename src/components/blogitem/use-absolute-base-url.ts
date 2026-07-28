import { useEffect, useState } from "react"
export function useAbsoluteBaseUrl() {
  const [baseUrl, setBaseUrl] = useState("")

  useEffect(() => {
    if (window.location.hostname === "localhost") {
      setBaseUrl("http://localhost:8888")
    } else {
      setBaseUrl("https://www.peterbe.com")
    }
  }, [])

  return baseUrl
}
