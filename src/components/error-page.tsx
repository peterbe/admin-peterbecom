import { Button, Code, Container, Text, Title } from "@mantine/core";

import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    console.warn(error);
    if (error.status === 404) {
      return <Custom404 />;
    }
  } else {
    console.error(error);
  }

  return (
    <Container p={50}>
      <Title ta="center">Error!</Title>
      <Text size="lg" c="dimmed" ta="center">
        Some sort of error was thrown during the rendering.
      </Text>
      {error instanceof Error ? (
        <Text ta="center">
          Error message: <Code>{error.message}</Code>
        </Text>
      ) : (
        <Text ta="center">Error unknown. See console logs.</Text>
      )}
    </Container>
  );
}

function Custom404() {
  return (
    <Container p={50}>
      <Title ta="center">404 Page not found</Title>
      <Text ta="center">
        <Link to="/">
          <Button variant="subtle" size="md">
            Take me back to home page
          </Button>
        </Link>
      </Text>
    </Container>
  );
}
