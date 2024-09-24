import { HttpResponse } from "msw";

import type { EditBlogitemT } from "../../types";
import { getBlogitems, renameBlogitem } from "./db";

// import { blogitems } from "./blogitems";

export type EditBlogitemRequestBody = EditBlogitemT & {
  keywords: string;
};

// export const blogitems: Record<string, EditBlogitemT> = {};

// blogitems["hello-world"] = {
//   id: 1,
//   oid: "hello-world",
//   title: "Hello World",
//   pub_date: "2024-09-05T18:49:09.935Z",
//   _published: true,
//   text: "Some *text*.\n\n```js\nfunction\n```",
//   keywords: ["one", "two"],
//   categories: [
//     {
//       id: 1,
//       name: "Software",
//     },
//   ],
//   summary: "This but a summary",
//   url: null,
//   display_format: "markdown",
//   codesyntax: "",
//   disallow_comments: false,
//   hide_comments: false,
//   modify_date: "2024-09-18T19:54:20.028Z",
//   open_graph_image: "/cache/9a/31/9a314f804d13b77b2bb5920ba3e06ffe.png",
//   _absolute_url: "/plog/random-titles",
//   archived: null,
// };

// export function addEditBlogitem(blogitem: EditBlogitemT) {
//   blogitems[blogitem.oid] = blogitem;
// }

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

  console.log({
    "TITLE BEFORE:": blogitem.title,
    "TITLE AFTER:": title.trim(),
  });

  blogitem.title = title.trim();
  blogitem.text = text.trim();
  blogitem.summary = summary.trim();
  blogitem.pub_date = body.pub_date;
  blogitem.keywords = keywords;

  // blogitems[oid] = blogitem;

  // console.log("TRANSFER...", body);
  // console.log("INTO....", blogitem);

  return HttpResponse.json({ blogitem });
}
