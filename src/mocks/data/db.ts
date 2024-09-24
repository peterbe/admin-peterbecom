import type { CategoryT, EditBlogitemT } from "../../types";

export function CATEGORIES(): {
  categories: CategoryT[];
} {
  return {
    categories: [
      { id: 1, name: "Software" },
      { id: 2, name: "Hardware" },
      { id: 3, name: "Foodware" },
    ],
  };
}

export type BlogitemFull = Omit<EditBlogitemT, "_published" | "_absolute_url">;

type Blogitems = Record<string, BlogitemFull>;
const blogitems: Blogitems = {};

export function getBlogitems(): Record<string, BlogitemFull> {
  return blogitems;
}

export function addBlogitem(blogitem: BlogitemFull) {
  blogitems[blogitem.oid] = blogitem;
}

export function renameBlogitem(oldOid: string, newOid: string) {
  const blogitem = blogitems[oldOid];
  if (blogitem) {
    delete blogitems[oldOid];
    blogitems[newOid] = blogitem;
  } else {
    throw new Error("Blogitem not found");
  }
}

export function getNextId(): number {
  return Math.max(0, ...Object.values(blogitems).map((b) => b.id)) + 1;
}
