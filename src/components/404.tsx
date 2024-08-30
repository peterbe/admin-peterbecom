import { Button, Container, Group, Text, Title } from "@mantine/core";
import { Link } from "wouter";

// import classes from "../styles/NotFoundTitle.module.css"

export function Custom404() {
  return (
    <Container>
      <Title>You have found a secret place.</Title>
      <Text size="lg" c="dimmed" ta="center">
        Unfortunately, this is only a 404 page. You may have mistyped the
        address, or the page has been moved to another URL.
      </Text>
      <Group ta="center">
        <Link href="/">
          <Button variant="subtle" size="md">
            Take me back to home page
          </Button>
        </Link>
      </Group>
    </Container>
  );
}
