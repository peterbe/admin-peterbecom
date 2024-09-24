import { HttpResponse } from "msw";

import type { EditBlogitemT } from "../../types";
import { getBlogitems, renameBlogitem } from "./db";

export type EditBlogitemRequestBody = EditBlogitemT & {
  keywords: string;
};

export const BLOGITEM = (slug: string | readonly string[]) => {
  if (typeof slug !== "string")
    return HttpResponse.text("Not Found", { status: 404 });
  const blogitem = getBlogitems()[slug];
  if (blogitem) {
    return HttpResponse.json({ blogitem });
  }
  return HttpResponse.text("Not Found", { status: 404 });
};

export function editBlogitem({
  slug,
  body,
}: {
  slug: string;
  body: EditBlogitemRequestBody;
}) {
  const errors: Record<string, string | string[]> = {};

  const oid = body.oid;
  if (!oid) errors.oid = "Required";

  const blogitem = getBlogitems()[slug];

  if (!blogitem) {
    return HttpResponse.text("Not Found", { status: 404 });
  }

  const title = body.title;
  if (!title) {
    errors.title = "Required";
  }
  const text = body.text;
  if (!text) {
    errors.text = "Required";
  }
  const summary = body.summary;

  const keywords = body.keywords
    .split("\n")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  if (Object.keys(errors).length) {
    return HttpResponse.json({ errors }, { status: 400 });
  }
  blogitem.oid = oid;
  if (oid !== slug) {
    renameBlogitem(slug, oid);
  }

  blogitem.title = title.trim();
  blogitem.text = text.trim();
  blogitem.summary = summary.trim();
  blogitem.pub_date = body.pub_date;
  blogitem.keywords = keywords;

  return HttpResponse.json({ blogitem });
}
