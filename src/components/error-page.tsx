import { Button, Code, Container, Text, Title } from "@mantine/core"
import { useEffect } from "react"

import {
  isRouteErrorResponse,
  Link,
  useRouteError,
  useSearchParams,
} from "react-router"

export default function ErrorPage() {
  const error = useRouteError()

  // When doing client-side navigation, sometimes the location of the dynamically imported
  // module does not work because the page you were originally on was from a different
  // build. By reloading, we're starting over again.
  const [searchParams] = useSearchParams()
  useEffect(() => {
    if (error && error instanceof Error) {
      if (
        error.message.includes("Failed to fetch dynamically imported module:")
      ) {
        if (!searchParams.get("reloaded")) {
          const oldURL = window.location.href
          const newURL = `${oldURL}${oldURL.includes("?") ? "&" : "?"}reloaded=1`
          console.warn(
            "Reloading the page because a dynamically loaded module failed",
          )
          window.location.href = newURL
        } else {
          console.warn("Already tried to reload the page")
        }
      }
    }
  }, [error, searchParams])

  if (isRouteErrorResponse(error)) {
    console.warn(error)
    if (error.status === 404) {
      return <Custom404 />
    }
  } else {
    console.error(error)
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
  )
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
  )
}
