import { defer } from "react-router-dom";
import { fetchComments } from "../components/api-utils";

export type RootLoaderData = {
  countUnapprovedComments: number;
};

export async function loader() {
  const commentsPromise = fetchComments(
    new URLSearchParams({ unapproved: "only", count: "True" }),
  );

  return defer({
    countUnapprovedComments: commentsPromise,
  });
}
