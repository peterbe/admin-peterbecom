import { HttpResponse } from "msw";

import type { BlogitemT } from "../../types";

const LOREM_IPSUM = `
Lorem ipsum odor amet, consectetuer adipiscing elit.
Cursus eros suspendisse taciti, urna malesuada hendrerit sem magna.
Per justo at finibus pharetra feugiat sapien condimentum tincidunt porta.
Tortor etiam aliquet vehicula torquent faucibus class. Duis mauris conubia
vivamus facilisi ex turpis semper ligula. Mauris semper suspendisse eget
cubilia sem feugiat bibendum eu. Ultricies in tempor per phasellus
molestie feugiat volutpat. Quisque mauris imperdiet ligula nisi ac porta inceptos.
`.trim();

const randomText = (noWords: number) => {
  const words = Math.floor(Math.random() * noWords) + 2;
  const pool = LOREM_IPSUM.split(" ")
    .filter(Boolean)
    .sort(() => Math.random() - 0.5);
  return capitalize(pool.slice(0, words).join(" "));
};

const randomTitle = () => randomText(5);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const blogitems: BlogitemT[] = [];

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

for (const i of Array.from({ length: 25 }, (_, i) => i)) {
  let pubDate = new Date(
    new Date().getTime() - 1000 * 60 * 60 * 24 * Math.random() * 450,
  );
  if (Math.random() > 0.9) {
    pubDate = new Date(pubDate.getTime() + 1000 * 60 * 60 * 24 * 10);
  }

  blogitems.push({
    id: i + 100,
    oid: `slug-${i}`,
    title: randomTitle(),
    pub_date: pubDate.toISOString(),
    _is_published: pubDate < new Date(),
    modify_date: new Date(
      new Date().getTime() - 1000 * 60 * 60 * 24 * Math.random() * 365,
    ).toISOString(),
    categories: [],
    keywords: ["one", "two"],
    summary: Math.random() > 0.5 ? randomText(30) : "",
    archived: null,
  });
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
