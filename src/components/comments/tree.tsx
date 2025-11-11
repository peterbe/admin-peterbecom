import { Alert, Box, Button, LoadingOverlay, Text } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { thousands } from "../../number-formatter"
import {
  commentsCountQueryKey,
  commentsQueryKey,
  fetchComments,
} from "../api-utils"
import { BatchSubmit } from "./batch-submit"
import { CommentsTree } from "./comments-tree"
import { Filters } from "./filters"
import { NoComments } from "./no-comments"
import type { CommentsServerData } from "./types"
import { useBatchSubmission } from "./use-batch-submission"

export function Tree() {
  const [searchParams] = useSearchParams()

  const { data, error, isPending, isFetching, refetch } =
    useQuery<CommentsServerData>({
      queryKey: commentsQueryKey(searchParams),
      queryFn: () => fetchComments(searchParams),
      refetchOnWindowFocus: false,
    })

  let title = "Comments"
  if (data) {
    title = `(${thousands(data.count)}) Comment${data.count === 1 ? "" : "s"}`
  } else if (isPending) {
    title = "Loading comments..."
  }
  useDocumentTitle(title)

  const queryClient = useQueryClient()

  const {
    toApprove,
    toggleToApprove,
    toDelete,
    toggleToDelete,
    reset,
    approved,
    setApproved,
    deleted,
    setDeleted,
  } = useBatchSubmission()

  const [isMutatatingBatchSubmit, setIsMutatatingBatchSubmit] = useState(
    queryClient.isMutating({
      mutationKey: ["batch-submit"],
    }) > 0,
  )
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMutatatingBatchSubmit(
        queryClient.isMutating({
          mutationKey: ["batch-submit"],
        }) > 0,
      )
    }, 3000)

    return () => clearTimeout(timer)
  }, [queryClient])

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
          <BatchSubmit
            toApprove={toApprove}
            toDelete={toDelete}
            setApproved={setApproved}
            setDeleted={setDeleted}
            reset={() => {
              reset()

              queryClient.invalidateQueries({
                queryKey: commentsCountQueryKey(),
              })
            }}
          />

          {(deleted.length > 0 || approved.length > 0) && (
            <Button
              variant="transparent"
              size="xs"
              onClick={() => {
                refetch()
              }}
            >
              Refetch
            </Button>
          )}

          {data.comments.length === 0 && <NoComments />}

          <CommentsTree
            showTitles={true}
            comments={data.comments}
            disabled={isPending || isMutatatingBatchSubmit}
            refetchComments={() => {
              queryClient.invalidateQueries({
                queryKey: commentsQueryKey(searchParams),
              })
            }}
            toApprove={toApprove}
            toDelete={toDelete}
            onCheckApprove={toggleToApprove}
            onCheckDelete={toggleToDelete}
            approved={approved}
            deleted={deleted}
          />
        </>
      )}
    </Box>
  )
}
