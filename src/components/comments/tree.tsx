import { Alert, Box, LoadingOverlay, Text } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { thousands } from "../../number-formatter";
import { commentsQueryKey, fetchComments } from "../api-utils";
import { BatchSubmit } from "./batch-submit";
import { CommentsTree } from "./comments-tree";
import { Filters } from "./filters";
import type { Comment } from "./types";
import { useBatchSubmission } from "./use-batch-submission";

type CommentsServerData = {
  comments: Comment[];
  count: number;
  oldest: string;
};

export function Tree() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  const { data, error, isPending, isFetching } = useQuery<CommentsServerData>({
    queryKey: commentsQueryKey(searchParams),
    queryFn: () => fetchComments(searchParams),
    refetchOnWindowFocus: false,
  });

  let title = "Comments";
  if (data) {
    title = `(${thousands(data.count)}) Comment${data.count === 1 ? "" : "s"}`;
  } else if (isPending) {
    title = "Loading comments...";
  }
  useDocumentTitle(title);

  const queryClient = useQueryClient();

  const { toApprove, toggleToApprove, toDelete, toggleToDelete } =
    useBatchSubmission();

  return (
    <Box>
      <LoadingOverlay visible={isPending} />
      {error && (
        <Alert color="red">Failed to load blogitems: {error.message}</Alert>
      )}
      <Filters disabled={isPending} />
      <Text ta="right">
        {isFetching && !isPending && "Refetching..."}&nbsp;
      </Text>

      {data && (
        <>
          <BatchSubmit toApprove={toApprove} toDelete={toDelete} />

          <CommentsTree
            comments={data.comments}
            disabled={isPending}
            refetchComments={() => {
              queryClient.invalidateQueries({
                queryKey: commentsQueryKey(searchParams),
              });
            }}
            toApprove={toApprove}
            toDelete={toDelete}
            onCheckApprove={toggleToApprove}
            onCheckDelete={toggleToDelete}
          />
        </>
      )}
    </Box>
  );
}
