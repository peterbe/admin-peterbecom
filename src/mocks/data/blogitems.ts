import { HttpResponse } from "msw"

import {
  addBlogitem as addBlogitemFull,
  type BlogitemFull,
  CATEGORIES,
  getBlogitems,
  getNextId,
} from "./db"

export type AddBlogitemRequestBody = {
  oid: string
  title: string

  categories: string[]
  display_format: string
  // keywords: string;
  pub_date: string
  summary: string
  text: string
  url: string
  keywords: string
  codesyntax: string
}

export function addBlogItem({ body }: { body: AddBlogitemRequestBody }) {
  const errors: Record<string, string | string[]> = {}

  const oid = body.oid
  if (!oid) errors.oid = "Required"
  const title = body.title
  if (!title) errors.title = "Required"
  const text = body.text
  if (!text) errors.text = "Required"
  const pubDate = body.pub_date
  if (!pubDate) errors.pub_date = "Required"
  const summary = body.summary
  const url = body.url
  const keywords = body.keywords
    .split("\n")
    .map((keyword) => keyword.trim())
    .filter(Boolean)

  const modifyDate = new Date().toISOString()
  const rawCategories = body.categories
  if (!rawCategories.length) {
    errors.categories = "Required"
  }

  if (Object.keys(errors).length) {
    return HttpResponse.json({ errors }, { status: 400 })
  }

  const categories = CATEGORIES().categories.filter((category) => {
    return rawCategories.includes(`${category.id}`)
  })

  const blogitem: BlogitemFull = {
    id: getNextId(),
    oid,
    title,
    text,
    pub_date: pubDate,
    modify_date: modifyDate,
    categories,
    keywords,
    summary,
    archived: null,
    url,
    display_format: body.display_format,
    codesyntax: body.codesyntax,
    disallow_comments: false,
    hide_comments: false,
    open_graph_image: null,
  }
  addBlogitemFull(blogitem)

  return HttpResponse.json({ blogitem })
}

export const BLOGITEMS = () => {
  throw new Error("Use ALL_BLOGITEMS instead")
}

export const ALL_BLOGITEMS = (params: URLSearchParams) => {
  const minimalFields = params.get("minimal_fields") === "true"

  const blogitems = Object.values(getBlogitems()).map((item) => {
    if (minimalFields) {
      return {
        id: item.id,
        oid: item.oid,
        title: item.title,
      }
    }
    return item
  })

  return HttpResponse.json({
    blogitems,
  })
}
