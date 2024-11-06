import { Box, Button, Group } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { Link } from "react-router-dom";

import { useCountUnapprovedComments } from "../hooks/use-count-unapproved-comments";
import { SignedIn } from "./signed-in";

export function Home() {
  useDocumentTitle("Home");

  const { data: countUnapprovedComments } = useCountUnapprovedComments();

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

          {countUnapprovedComments && (
            <Button
              size="xl"
              component={Link}
              to={
                countUnapprovedComments?.count
                  ? "/plog/comments?only=unapproved"
                  : "/plog/comments"
              }
            >
              {countUnapprovedComments?.count
                ? `(${countUnapprovedComments.count}) Comments`
                : "Comments"}
            </Button>
          )}
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
  );
}
