import { http, HttpResponse, type PathParams } from "msw"

import { ANALYTICS } from "./data/analytics"
import {
  BLOGITEM,
  type EditBlogitemRequestBody,
  editBlogitem,
} from "./data/blogitem"
import {
  type AddBlogitemRequestBody,
  BLOGITEMS,
  addBlogItem,
} from "./data/blogitems"
import { COMMENTS } from "./data/comments"
import {
  CATEGORIES,
  type EditCategoryRequestBody,
  deleteCategory,
  editCategory,
} from "./data/db"
import {
  type EditBlogitemImagesRequestBody,
  IMAGES,
  OPEN_GRAPH_IMAGE,
  addBlogItemImage,
} from "./data/images"
import { PREVIEW } from "./data/preview"
import { USER } from "./data/user"

type SlugParams = {
  slug: string
}

export const handlers = [
  http.get("/api/v0/whoami", ({ cookies }) => {
    return HttpResponse.json(USER({ cookies }))
  }),

  http.get("/api/v0/categories", () => {
    return HttpResponse.json(CATEGORIES())
  }),

  http.post<PathParams, EditCategoryRequestBody>(
    "/api/v0/categories",
    async ({ request, cookies }) => {
      if (!cookies.mocksessionid) return new HttpResponse(null, { status: 403 })
      const body = await request.json()
      return editCategory({ body })
    },
  ),
  http.delete("/api/v0/categories", async ({ request, cookies }) => {
    if (!cookies.mocksessionid) return new HttpResponse(null, { status: 403 })
    const url = request.url
    return deleteCategory(new URLSearchParams(new URL(url).search))
  }),

  http.post("/api/v0/plog/preview/", () => {
    return HttpResponse.json(PREVIEW())
  }),

  http.get("/api/v0/plog/comments/", ({ request, cookies }) => {
    if (!cookies.mocksessionid) return new HttpResponse(null, { status: 403 })
    const url = request.url
    return COMMENTS(new URLSearchParams(new URL(url).search))
  }),

  http.get("/api/v0/plog/:slug/images", ({ params }) => {
    return IMAGES(params.slug)
  }),

  http.post<SlugParams, EditBlogitemImagesRequestBody>(
    "/api/v0/plog/:slug/images",
    async ({ params, request }) => {
      const slug = params.slug
      const body = await request.json()
      return addBlogItemImage({ slug, body })
    },
  ),

  http.get("/api/v0/plog/:slug/open-graph-image", ({ params }) => {
    return OPEN_GRAPH_IMAGE(params.slug)
  }),

  http.get("/api/v0/plog/:slug", ({ params }) => {
    const slug = params.slug
    return BLOGITEM(slug)
  }),

  http.post<SlugParams, EditBlogitemRequestBody>(
    "/api/v0/plog/:slug",
    async ({ params, request, cookies }) => {
      if (!cookies.mocksessionid) return new HttpResponse(null, { status: 403 })
      const slug = params.slug
      const body = await request.json()
      return editBlogitem({ slug, body })
    },
  ),

  http.get("/api/v0/plog/", async ({ request }) => {
    const url = request.url
    return BLOGITEMS(new URLSearchParams(new URL(url).search))
  }),

  http.post<PathParams, AddBlogitemRequestBody>(
    "/api/v0/plog/",
    async ({ request, cookies }) => {
      if (!cookies.mocksessionid) return new HttpResponse(null, { status: 403 })
      const body = await request.json()
      return addBlogItem({ body })
    },
  ),

  http.post("/oidc/authenticate/", () => {
    return HttpResponse.text("authenticated", {
      headers: {
        // See ./data/user.ts
        "set-cookie": "mocksessionid=mruser",
      },
    })
  }),

  http.get("/api/v0/analytics/query", ({ request, cookies }) => {
    if (!cookies.mocksessionid) return new HttpResponse(null, { status: 403 })
    const url = request.url
    return ANALYTICS(new URLSearchParams(new URL(url).search))
  }),
  // REMEMBER! Order is important. Slugs that can hide other regexes.
]
