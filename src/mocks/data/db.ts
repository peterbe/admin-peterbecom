import { HttpResponse } from "msw"

import type { Comment } from "../../components/comments/types"
import type { CategoryT, EditBlogitemT } from "../../types"

const categories: CategoryT[] = [
  { id: 1, name: "Software", count: 0 },
  { id: 2, name: "Hardware", count: 0 },
  { id: 3, name: "Foodware", count: 0 },
]

export function CATEGORIES(): {
  categories: CategoryT[]
} {
  return {
    categories,
  }
}

export type EditCategoryRequestBody = {
  name: string
  category?: string
}

export function deleteCategory(params: URLSearchParams) {
  const foundIndex = categories.findIndex(
    (c) => c.id === Number(params.get("id")),
  )
  if (foundIndex === -1) {
    return HttpResponse.json(
      { ok: false, error: "Category not found" },
      { status: 404 },
    )
  }
  categories.splice(foundIndex, 1)
  return HttpResponse.json({ ok: true })
}

export function editCategory({ body }: { body: EditCategoryRequestBody }) {
  const found = categories.find(
    (c) => body.category && c.id === Number(body.category),
  )
  if (found) {
    found.name = body.name
  } else {
    categories.push({
      id: Math.max(0, ...categories.map((b) => b.id)) + 1,
      name: body.name,
      count: 0,
    })
  }

  return HttpResponse.json({ ok: true })
}

export type BlogitemFull = Omit<EditBlogitemT, "_published" | "_absolute_url">

type Blogitems = Record<string, BlogitemFull>
const blogitems: Blogitems = {}

export function getBlogitems(): Record<string, BlogitemFull> {
  return blogitems
}

export function addBlogitem(blogitem: BlogitemFull) {
  blogitems[blogitem.oid] = blogitem
}

export function renameBlogitem(oldOid: string, newOid: string) {
  const blogitem = blogitems[oldOid]
  if (blogitem) {
    delete blogitems[oldOid]
    blogitems[newOid] = blogitem
  } else {
    throw new Error("Blogitem not found")
  }
}

export function getNextId(): number {
  return Math.max(0, ...Object.values(blogitems).map((b) => b.id)) + 1
}

const location = {
  city: "City",
  continent_code: "xx",
  continent_name: "Continent",
  country_code: "US",
  country_name: "United States",
  latitude: 123.0,
  longitude: -1.23,
  postal_code: null,
  region: null,
  time_zone: "UTC",
}
const COMMENTS: Comment[] = [
  {
    id: 1,
    oid: "abc123",
    add_date: new Date().toISOString(),
    age_seconds: 0,
    approved: false,
    auto_approved: false,
    blogitem: {
      id: 1,
      oid: "hello-world",
      title: "Hello world",
      _absolute_url: "/plog/hello-world",
    },
    comment: "Bla bla",
    email: "email@example.com",
    name: "Name",
    location,
    max_add_date: new Date().toISOString(),
    modify_date: new Date().toISOString(),
    page: 1,
    rendered: "Bla<br/>bla",
    replies: [],
    user_agent: "",
    user_other_comments_count: 0,
    _absolute_url: "/plog/hello-world#abc123",
    _bumped: false,
    _clues: {
      good: { text: "Good!" },
      bad: { agent: "Bad!" },
    },
    gravatar_url: "https://www.peterbe.com/avatar.abc123.png",
    classification: null,
  },
  {
    id: 2,
    oid: "xyz789",
    add_date: new Date().toISOString(),
    age_seconds: 0,
    approved: true,
    auto_approved: false,
    blogitem: {
      id: 1,
      oid: "hello-world",
      title: "Hello world",
      _absolute_url: "/plog/hello-world",
    },
    comment: "This has already been approved",
    email: "email@example.com",
    name: "Name",
    location,
    max_add_date: new Date().toISOString(),
    modify_date: new Date().toISOString(),
    page: 1,
    rendered: "This has already been <strong>approved</strong>",
    replies: [],
    user_agent: "",
    user_other_comments_count: 0,
    _absolute_url: "/plog/hello-world#abc123",
    _bumped: false,
    _clues: {
      good: {},
      bad: {},
    },
    gravatar_url: "https://www.peterbe.com/avatar.xyz789.png",
    classification: {
      classification: "ham",
    },
  },
]

export function getComments() {
  return COMMENTS
}
