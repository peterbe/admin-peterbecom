import { Box, Button, Group } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { Link } from "react-router"

import { useCountUnapprovedComments } from "../hooks/use-count-unapproved-comments"
import { SignedIn } from "./signed-in"

export function Home() {
  useDocumentTitle("Home")

  const { data } = useCountUnapprovedComments()

  const size = "lg"

  return (
    <SignedIn>
      <ButtonBox>
        <Group justify="center">
          <Button
            size={size}
            component={Link}
            to="/plog"
            viewTransition
            fullWidth
          >
            Blogitems
          </Button>
          <Button
            size={size}
            component={Link}
            to="/plog/add"
            viewTransition
            fullWidth
          >
            Add blogitem
          </Button>
          <CommentsButton count={data?.count} size={size} />
        </Group>
      </ButtonBox>
      <ButtonBox>
        <Group justify="center">
          <Button
            size={size}
            component={Link}
            to="/spam/signatures"
            viewTransition
            prefetch="intent"
            fullWidth
          >
            Spam Comment Signatures
          </Button>
          <Button
            size={size}
            component={Link}
            to="/spam/patterns"
            viewTransition
            fullWidth
          >
            Spam Comment Patterns
          </Button>
        </Group>
      </ButtonBox>
      <ButtonBox>
        <Group justify="center">
          <Button
            size={size}
            component={Link}
            to="/plog/categories"
            viewTransition
            prefetch="intent"
            fullWidth
          >
            Categories
          </Button>
          <Button
            size={size}
            component={Link}
            to="/cdn"
            viewTransition
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
            viewTransition
            prefetch="intent"
            fullWidth
          >
            Analytics Query
          </Button>
          <Button
            size={size}
            component={Link}
            to="/analytics/charts"
            viewTransition
            prefetch="intent"
            fullWidth
          >
            Analytics Charts
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
      viewTransition
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
