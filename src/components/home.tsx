import { Box, Button, Group } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { Link } from "react-router"

import { useCountUnapprovedComments } from "../hooks/use-count-unapproved-comments"
import { useCommentsQuery } from "./comments/use-comments-query"
import { SignedIn } from "./signed-in"

export function Home() {
  useDocumentTitle("Home")

  const { data } = useCountUnapprovedComments()

  // Pre-emptively warm up the query cache for the comments page,
  // since it's likely the user will click there next.
  useCommentsQuery(new URLSearchParams({ only: "unapproved" }))

  const size = "lg"

  return (
    <SignedIn>
      <ButtonBox>
        <Group justify="center">
          <Button size={size} component={Link} to="/plog" fullWidth>
            Blogitems
          </Button>
          <Button size={size} component={Link} to="/plog/add" fullWidth>
            Add blogitem
          </Button>
          <Button
            size={size}
            component={Link}
            to="/plog/add-by-photo"
            fullWidth
          >
            Add by photo
          </Button>
          <CommentsButton count={data?.count} size={size} />
          <Button
            size={size}
            component={Link}
            to="/plog/highlighted-comments"
            fullWidth
          >
            Highlighted Comments
          </Button>
        </Group>
      </ButtonBox>
      <ButtonBox>
        <Group justify="center">
          <Button
            size={size}
            component={Link}
            to="/spam/signatures"
            prefetch="intent"
            fullWidth
          >
            Spam Comment Signatures
          </Button>
          <Button size={size} component={Link} to="/spam/patterns" fullWidth>
            Spam Comment Patterns
          </Button>
        </Group>
      </ButtonBox>
      <ButtonBox>
        <Group justify="center">
          <Button
            size={size}
            component={Link}
            to="/llmcalls"
            prefetch="intent"
            fullWidth
          >
            LLM Calls
          </Button>
          <Button
            size={size}
            component={Link}
            to="/plog/categories"
            prefetch="intent"
            fullWidth
          >
            Categories
          </Button>
          <Button
            size={size}
            component={Link}
            to="/cdn"
            prefetch="intent"
            fullWidth
          >
            CDN
          </Button>
        </Group>
      </ButtonBox>
      <ButtonBox>
        <Group justify="center">
          <Button
            size={size}
            component={Link}
            to="/analytics/query"
            prefetch="intent"
            fullWidth
          >
            Analytics Query
          </Button>
          <Button
            size={size}
            component={Link}
            to="/analytics/charts"
            prefetch="intent"
            fullWidth
          >
            Analytics Charts
          </Button>
          <Button
            size={size}
            component={Link}
            to="/analytics/llmcalls"
            prefetch="intent"
            fullWidth
          >
            Analytics LLM Calls
          </Button>
        </Group>
      </ButtonBox>
    </SignedIn>
  )
}

function CommentsButton({
  count,
  size,
}: {
  count?: number
  size: "xl" | "lg" | "md" | "sm" | "xs"
}) {
  return (
    <Button
      size={size}
      component={Link}
      to={count ? "/plog/comments?only=unapproved" : "/plog/comments"}
      fullWidth
    >
      {count ? `Comments (${count})` : "Comments"}
    </Button>
  )
}

function ButtonBox({ children }: { children: React.ReactNode }) {
  return (
    <Box mb={50} w={{ base: 320, sm: 400, lg: 500 }} ta="center" mx="auto">
      {children}
    </Box>
  )
}
