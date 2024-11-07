import { Box, Button, Group } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
// import { Await, Link, useRouteLoaderData } from "react-router-dom";
import { Link } from "react-router-dom"

import { useCountUnapprovedComments } from "../hooks/use-count-unapproved-comments"
// import { Suspense } from "react";
// import type { RootLoaderData } from "../loaders/root";
import { SignedIn } from "./signed-in"

export function Home() {
  useDocumentTitle("Home")

  // const { countUnapprovedComments } = useRouteLoaderData(
  //   "root"
  // ) as RootLoaderData;
  const { data, isPending } = useCountUnapprovedComments()
  console.log("RENDERING HOME COMPONENT", { data: !!data, isPending })

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

          {/* <Suspense fallback={<CommentsButton />}>
            <Await
              resolve={countUnapprovedComments}
              errorElement={<CommentsButton />}
            >
              {(countUnapprovedComments) => (
                <CommentsButton count={countUnapprovedComments.count} />
              )}
            </Await>
          </Suspense> */}
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
