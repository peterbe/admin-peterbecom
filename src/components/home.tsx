import { Box, Button, Group } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { Link } from "wouter";

import { useCountUnapprovedComments } from "../hooks/use-count-unapproved-comments";
import { SignedIn } from "./signed-in";

export function Home() {
  useDocumentTitle("Home");

  const { data: countUnapprovedComments } = useCountUnapprovedComments();

  return (
    <SignedIn>
      <Box m={100}>
        <Group justify="center">
          <Button size="xl" component={Link} to="/plog">
            Blogitems
          </Button>
          <Button size="xl" component={Link} to="/plog/add">
            Add blogitem
          </Button>
          <Button size="xl" component={Link} to="/plog/comments">
            Comments
          </Button>
          {countUnapprovedComments && (
            <Button
              size="xl"
              component={Link}
              to="/plog/comments?only=unapproved"
            >
              ({countUnapprovedComments.count}) Unapproved Comments
            </Button>
          )}
        </Group>
      </Box>
    </SignedIn>
  );
}
