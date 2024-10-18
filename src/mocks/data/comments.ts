import { HttpResponse } from "msw";
import type { CommentsServerData } from "../../components/comments/types";

import { getComments } from "./db";

export const COMMENTS = (params: URLSearchParams) => {
  const unapproved = params.get("unapproved");
  const autoapproved = params.get("autoapproved");

  const filtered = Object.values(getComments()).filter((item) => {
    if (unapproved === "only") {
      return !item.approved;
    }
    if (autoapproved === "only") {
      return item.auto_approved;
    }
    return true;
  });

  const returned: CommentsServerData = {
    comments: filtered,
    count: filtered.length,
    oldest: filtered.map((x) => x.add_date).sort()[0],
  };
  return HttpResponse.json(returned);
};
