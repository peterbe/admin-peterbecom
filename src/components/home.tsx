import { Box, Button, Group } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { Link } from "wouter";

import { SignedIn } from "./signed-in";

export function Home() {
  useDocumentTitle("Home");

  return (
    <SignedIn>
      <Box m={100}>
        <Group justify="center">
          <Button size="xl" component={Link} to="/">
            Home
          </Button>
          <Button size="xl" component={Link} to="/plog">
            Blogitems
          </Button>
          <Button size="xl" component={Link} to="/plog/comments">
            Comments
          </Button>
        </Group>
      </Box>
    </SignedIn>
  );
}
