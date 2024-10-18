import type { Comment } from "../../components/comments/types";
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
};
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
  },
];

export function getComments() {
  return COMMENTS;
}
