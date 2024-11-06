import { fetchComments } from "../components/api-utils";

export type RootLoaderData = {
  countUnapprovedComments: number;
};

export async function loader(): Promise<RootLoaderData> {
  const comments = await fetchComments(
    new URLSearchParams({ unapproved: "only", count: "True" }),
  );

  return {
    countUnapprovedComments: comments.count,
  };
}
