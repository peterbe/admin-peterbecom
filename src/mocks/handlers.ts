import { http, HttpResponse } from "msw";

import { BLOGITEM } from "./data/blogitem";
import { BLOGITEMS } from "./data/blogitems";
import { CATEGORIES } from "./data/categories";
import { IMAGES, OPEN_GRAPH_IMAGE } from "./data/images";
import { PREVIEW } from "./data/preview";
import { USER } from "./data/user";

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

  http.get("/api/v0/plog/:slug/open-graph-image", ({ params }) => {
    return OPEN_GRAPH_IMAGE(params.slug);
  }),

  http.get("/api/v0/plog/:slug", ({ params }) => {
    const slug = params.slug;
    return BLOGITEM(slug);
  }),

  http.get("/api/v0/plog/", ({ request }) => {
    const url = request.url;
    return BLOGITEMS(new URLSearchParams(new URL(url).search));
  }),

  http.post("/oidc/authenticate/", () => {
    return HttpResponse.text("authenticated", {
      headers: {
        // See ./data/user.ts
        "set-cookie": "mocksessionid=mruser",
      },
    });
  }),
];
