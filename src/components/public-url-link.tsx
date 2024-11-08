import { Anchor } from "@mantine/core"
import { useEffect, useState } from "react"

export function PublicURL({
  path,
  children,
}: {
  path: string
  children: React.ReactNode
}) {
  const [url, setUrl] = useState<URL>(new URL(path, "https://www.peterbe.com"))

  useEffect(() => {
    if (window.location.hostname === "localhost") {
      setUrl(new URL(path, "http://localhost:3000"))
    }
  }, [path])

  return (
    <Anchor href={url.toString()} target="_blank" underline="always">
      {children}
    </Anchor>
  )
}
