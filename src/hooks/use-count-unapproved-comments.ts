import { useQuery } from "@tanstack/react-query";
import {
  commentsCountQueryKey,
  fetchCommentsCount,
} from "../components/api-utils";

type Counts = {
  count: number;
};

export function useCountUnapprovedComments() {
  return useQuery<Counts>({
    queryKey: commentsCountQueryKey(),
    queryFn: fetchCommentsCount,
  });
}
