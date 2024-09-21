import { http, HttpResponse, type PathParams } from "msw";

import {
  BLOGITEM,
  type EditBlogitemRequestBody,
  editBlogitem,
} from "./data/blogitem";
import {
  type AddBlogitemRequestBody,
  BLOGITEMS,
  addBlogItem,
} from "./data/blogitems";
import { CATEGORIES } from "./data/categories";
import {
  type EditBlogitemImagesRequestBody,
  IMAGES,
  OPEN_GRAPH_IMAGE,
  addBlogItemImage,
} from "./data/images";
import { PREVIEW } from "./data/preview";
import { USER } from "./data/user";

type SlugParams = {
  slug: string;
};

export const handlers = [
  http.get("/api/v0/whoami", ({ cookies }) => {
    return HttpResponse.json(USER({ cookies }));
  }),

  http.get("/api/v0/categories", () => {
    return HttpResponse.json(CATEGORIES());
  }),

  http.post("/api/v0/plog/preview/", () => {
    return HttpResponse.json(PREVIEW());
  }),

  http.get("/api/v0/plog/:slug/images", ({ params }) => {
    return IMAGES(params.slug);
  }),

  http.post<SlugParams, EditBlogitemImagesRequestBody>(
    "/api/v0/plog/:slug/images",
    async ({ params, request }) => {
      const slug = params.slug;
      const body = await request.json();
      return addBlogItemImage({ slug, body });
    },
  ),

  http.get("/api/v0/plog/:slug/open-graph-image", ({ params }) => {
    return OPEN_GRAPH_IMAGE(params.slug);
  }),

  http.get("/api/v0/plog/:slug", ({ params }) => {
    const slug = params.slug;
    return BLOGITEM(slug);
  }),

  http.post<SlugParams, EditBlogitemRequestBody>(
    "/api/v0/plog/:slug",
    async ({ params, request }) => {
      const slug = params.slug;
      const body = await request.json();
      return editBlogitem({ slug, body });
    },
  ),

  http.get("/api/v0/plog/", async ({ request }) => {
    const url = request.url;
    return BLOGITEMS(new URLSearchParams(new URL(url).search));
  }),

  http.post<PathParams, AddBlogitemRequestBody>(
    "/api/v0/plog/",
    async ({ request }) => {
      const body = await request.json();

      return addBlogItem({ body });
    },
  ),

  http.post("/oidc/authenticate/", () => {
    return HttpResponse.text("authenticated", {
      headers: {
        // See ./data/user.ts
        "set-cookie": "mocksessionid=mruser",
      },
    });
  }),
];
