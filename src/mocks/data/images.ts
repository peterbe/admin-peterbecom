import { HttpResponse } from "msw"
import type { ImageT } from "../../hooks/use-images"
import { getBlogitems } from "./db"

const UPLOADED_IMAGES: Record<string, ImageT[]> = {}
export const IMAGES = (slug: string | readonly string[]) => {
  if (typeof slug !== "string")
    return new HttpResponse("Not Found", { status: 404 })

  const blogitem = getBlogitems()[slug]
  if (!blogitem) {
    return new HttpResponse("Not Found", { status: 404 })
  }
  if (slug in UPLOADED_IMAGES) {
    return HttpResponse.json({ images: UPLOADED_IMAGES[slug] })
  }
  UPLOADED_IMAGES[slug] = []
  const images = UPLOADED_IMAGES[slug]
  if (images) {
    return HttpResponse.json({ images })
  }

  return new HttpResponse("Not Found", { status: 404 })
}

export const OPEN_GRAPH_IMAGE = (slug: string | readonly string[]) => {
  if (typeof slug !== "string")
    return new HttpResponse("Not Found", { status: 404 })

  if (slug === "hello-world") {
    return HttpResponse.json({ images: [] })
  }

  return new HttpResponse("Not Found", { status: 404 })
}

export type EditBlogitemImagesRequestBody = {
  file: Buffer
  title: string
}
export function addBlogItemImage({
  slug,
  body,
}: {
  slug: string
  body: EditBlogitemImagesRequestBody
}) {
  console.log({ slug, body })
  return HttpResponse.json({ images: [] })
}
