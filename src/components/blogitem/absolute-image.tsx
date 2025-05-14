import { Image } from "@mantine/core"
import { useAbsoluteBaseUrl } from "./use-absolute-base-url"

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
  const imageBaseUrl = useAbsoluteBaseUrl()

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
