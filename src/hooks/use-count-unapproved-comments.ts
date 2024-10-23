import { useQuery } from "@tanstack/react-query";
import { fetchComments } from "../components/api-utils";

type Counts = {
  count: number;
};

export function useCountUnapprovedComments() {
  return useQuery<Counts>({
    queryKey: ["count-unapproved-comments"],
    queryFn: () =>
      fetchComments(new URLSearchParams({ unapproved: "only", count: "true" })),
    retry: false,
  });
}
