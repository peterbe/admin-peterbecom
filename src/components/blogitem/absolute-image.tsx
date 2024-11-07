import { Image } from "@mantine/core"
import { useEffect, useState } from "react"

export function AbsoluteImage({
  src,
  alt,
  radius = "md",
  w,
  h,
}: {
  src: string
  alt?: string
  radius?: "sm" | "md"
  w?: number
  h?: number
}) {
  const [imageBaseUrl, setImageBaseUrl] = useState("")

  useEffect(() => {
    if (window.location.hostname === "localhost") {
      setImageBaseUrl("http://localhost:8000")
    } else {
      setImageBaseUrl("https://www.peterbe.com")
    }
  }, [])

  return (
    <Image
      radius={radius}
      w={w}
      h={h}
      src={imageBaseUrl + src}
      alt={alt || ""}
    />
  )
}
