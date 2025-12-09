import { Alert, Badge, Box, LoadingOverlay, Paper, Text } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router"
import {
  fetchHighlightedComments,
  highlightedCommentsQueryKey,
} from "../api-utils"
import { DisplayDate } from "../blogitems/list-table"

type CommentData = {
  id: number
  oid: string
  name: string
  email: string
  comment: string
  rendered: string
  add_date: string
  highlighted: string
  is_first: boolean
}

type HighlightedComment = CommentData & {
  parent_id: null | number
  blogitem: {
    id: number
    oid: string
    title: string
    pub_date: string
  }
}

type ServerData = {
  comments: HighlightedComment[]
  count: number
}

export function HighlightedCommentsTable() {
  const { data, error, isPending } = useQuery<ServerData>({
    queryKey: highlightedCommentsQueryKey(),
    queryFn: fetchHighlightedComments,
  })

  useDocumentTitle(
    data
      ? `(${data.count}) Highlighted comments`
      : "Loading highlighted comments",
  )

  return (
    <Box mb={50} pos="relative">
      <LoadingOverlay visible={isPending} />

      {error && <Alert color="red">Error: {error.message}</Alert>}
      {data && <p>{data.comments.length} comments</p>}
      {data?.comments.map((comment) => {
        const sp = new URLSearchParams({
          search: `oid:${comment.blogitem.oid} ${comment.oid}`,
        })
        const commentsUrl = `/plog/comments?${sp}`
        return (
          <Paper shadow="xs" p="xl" key={comment.id} mb={60}>
            <Text>
              {comment.name ? <b>{comment.name}</b> : <i>Anonymous</i>} on{" "}
              <b>{comment.blogitem.title}</b>{" "}
            </Text>
            {comment.parent_id && (
              <Badge variant="light" color="orange">
                A reply comment
              </Badge>
            )}
            {!comment.is_first && (
              <Badge variant="light" color="grape">
                Not first
              </Badge>
            )}
            <Text>
              <Link to={commentsUrl}>
                <DisplayDate date={comment.add_date} />
              </Link>
            </Text>
            <Text>
              Highlighted{" "}
              <b>
                <DisplayDate date={comment.highlighted} />
              </b>
            </Text>
            <Text
              pt="sm"
              size="sm"
              dangerouslySetInnerHTML={{ __html: comment.rendered }}
            />
          </Paper>
        )
      })}
    </Box>
  )
}
