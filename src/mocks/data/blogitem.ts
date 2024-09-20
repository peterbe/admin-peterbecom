import { HttpResponse } from "msw";

import type { EditBlogitemT } from "../../types";

export const BLOGITEM = (slug: string | readonly string[]) => {
  //   if (typeof slug !== "string")
  //     return HttpResponse.text("Not Found", { status: 404 });

  if (slug === "hello-world") {
    const blogitem: EditBlogitemT = {
      id: 1,
      oid: "hello-world",
      title: "Hello World",
      pub_date: "2024-09-05T18:49:09.935Z",
      _published: true,
      text: "Some *text*.\n\n```js\nfunction\n```",
      keywords: ["one", "two"],
      categories: [
        {
          id: 1,
          name: "Software",
        },
      ],
      summary: "This but a summary",
      url: null,
      display_format: "markdown",
      codesyntax: "",
      disallow_comments: false,
      hide_comments: false,
      modify_date: "2024-09-18T19:54:20.028Z",
      open_graph_image: "/cache/9a/31/9a314f804d13b77b2bb5920ba3e06ffe.png",
      _absolute_url: "/plog/random-titles",
      archived: null,
    };
    return HttpResponse.json({ blogitem });
  }
  return HttpResponse.text("Not Found", { status: 404 });
};
