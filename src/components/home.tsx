import { Box, Button, Group } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { Link } from "react-router-dom"

import { useCountUnapprovedComments } from "../hooks/use-count-unapproved-comments"
import { SignedIn } from "./signed-in"

export function Home() {
  useDocumentTitle("Home")

  const { data } = useCountUnapprovedComments()

  return (
    <SignedIn>
      <Box m={50}>
        <Group justify="center">
          <Button size="xl" component={Link} to="/plog" viewTransition>
            Blogitems
          </Button>
          <Button size="xl" component={Link} to="/plog/add" viewTransition>
            Add blogitem
          </Button>
          <CommentsButton count={data?.count} />
        </Group>
      </Box>
      <Box m={100}>
        <Group justify="center">
          <Button
            size="xl"
            component={Link}
            to="/spam/signatures"
            viewTransition
          >
            Spam Comment Signatures
          </Button>
          <Button size="xl" component={Link} to="/spam/patterns" viewTransition>
            Spam Comment Patterns
          </Button>
        </Group>
      </Box>
      <Box m={100}>
        <Group justify="center">
          <Button
            size="xl"
            component={Link}
            to="/plog/categories"
            viewTransition
          >
            Categories
          </Button>
        </Group>
      </Box>
    </SignedIn>
  )
}

function CommentsButton({ count }: { count?: number }) {
  return (
    <Button
      size="xl"
      component={Link}
      viewTransition
      to={count ? "/plog/comments?only=unapproved" : "/plog/comments"}
    >
      {count ? `Comments (${count})` : "Comments"}
    </Button>
  )
}
