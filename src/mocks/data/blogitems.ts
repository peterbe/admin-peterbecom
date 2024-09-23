import { HttpResponse } from "msw";

import type { BlogitemT, EditBlogitemT } from "../../types";
import { addEditBlogitem } from "./blogitem";

type AddBlogitemT = Omit<BlogitemT, "_is_published"> & {
  url: string;
};
export type AddBlogitemRequestBody = {
  oid: string;
  title: string;

  categories: string[];
  display_format: string;
  // keywords: string;
  pub_date: string;
  summary: string;
  text: string;
  url: string;
  keywords: string;
  codesyntax: string;
};

const blogitems: (BlogitemT | AddBlogitemT)[] = [];

blogitems.push({
  id: 1,
  oid: "hello-world",
  title: "Hello World",
  pub_date: new Date(
    new Date().getTime() - 1000 * 60 * 60 * 24 * 7,
  ).toISOString(),
  _is_published: true,
  modify_date: new Date(new Date().getTime() - 1000 * 60 * 60).toISOString(),
  categories: [
    {
      id: 1,
      name: "Software",
    },
    { id: 2, name: "Hardware" },
  ],
  keywords: ["one", "two"],
  summary: "This is but a summary",
  archived: null,
});

blogitems.push({
  id: 2,
  oid: "fit-for-crime",
  title: "Fit for Crime",
  pub_date: new Date(
    new Date().getTime() - 1000 * 60 * 60 * 24 * 8,
  ).toISOString(),
  _is_published: true,
  modify_date: new Date(
    new Date().getTime() - 1000 * 60 * 60 * 5,
  ).toISOString(),
  categories: [{ id: 2, name: "Hardware" }],
  keywords: ["foo", "bar"],
  summary: "",
  archived: null,
});

const ids = blogitems.map((item) => item.id);
if (ids.length !== new Set(ids).size) throw new Error("ids not unique");

export function addBlogItem({ body }: { body: AddBlogitemRequestBody }) {
  const errors: Record<string, string | string[]> = {};

  const oid = body.oid;
  if (!oid) errors.oid = "Required";
  const title = body.title;
  if (!title) errors.title = "Required";
  const text = body.text;
  if (!text) errors.text = "Required";
  const pubDate = body.pub_date;
  if (!pubDate) errors.pub_date = "Required";
  const summary = body.summary;
  const url = body.url;
  const keywords = body.keywords
    .split("\n")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  const modifyDate = new Date().toISOString();

  if (Object.keys(errors).length) {
    return HttpResponse.json({ errors }, { status: 400 });
  }

  const blogitem: AddBlogitemT = {
    id: blogitems.length + 1,
    oid,
    title: body.title,
    pub_date: pubDate,
    // _is_published: pubDate < new Date().toISOString(),
    modify_date: modifyDate,
    categories: [],
    keywords,
    summary,
    archived: null,
    url,
  };
  blogitems.push(blogitem);

  const editBlogitem: EditBlogitemT = {
    id: blogitem.id,
    oid: blogitem.oid,
    title: blogitem.title,
    text: text,
    summary: blogitem.summary,
    modify_date: new Date().toISOString(),
    pub_date: pubDate,
    keywords,
    display_format: body.display_format,
    codesyntax: body.codesyntax,
    url: url,
    disallow_comments: false,
    hide_comments: false,
    _absolute_url: "",
    categories: [],
    open_graph_image: null,
    archived: null,
  };

  addEditBlogitem(editBlogitem);
  return HttpResponse.json({ blogitem });
}

export const BLOGITEMS = (params: URLSearchParams) => {
  const all = {
    blogitems,
  };

  const filtered = all.blogitems.filter((item) => {
    return (
      !params.get("search") ||
      item.title.includes(params.get("search") as string)
    );
  });
  if (params.get("order") === "modify_date") {
    filtered.sort((a, b) => {
      return b.modify_date.localeCompare(a.modify_date);
    });
  } else if (params.get("order") === "pub_date") {
    filtered.sort((a, b) => {
      return b.pub_date.localeCompare(a.pub_date);
    });
  }

  return HttpResponse.json({
    blogitems: filtered,
  });
};
