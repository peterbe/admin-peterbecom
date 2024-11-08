import { Container, Title } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { SignedIn } from "../signed-in"
import { List } from "./list"

export function Component() {
  useDocumentTitle("Categories")

  return (
    <SignedIn>
      <Container>
        <Title>Categories</Title>
        <List />
      </Container>
    </SignedIn>
  )
}
