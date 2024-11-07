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
          <Button size="xl" component={Link} to="/plog">
            Blogitems
          </Button>
          <Button size="xl" component={Link} to="/plog/add">
            Add blogitem
          </Button>
          <CommentsButton count={data?.count} />
        </Group>
      </Box>
      <Box m={100}>
        <Group justify="center">
          <Button size="xl" component={Link} to="/spam/signatures">
            Spam Comment Signatures
          </Button>
          <Button size="xl" component={Link} to="/spam/patterns">
            Spam Comment Patterns
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
      to={count ? "/plog/comments?only=unapproved" : "/plog/comments"}
    >
      {count ? `Comments (${count})` : "Comments"}
    </Button>
  )
}
