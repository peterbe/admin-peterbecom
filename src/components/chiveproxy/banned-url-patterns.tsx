import { Container } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { SignedIn } from "../signed-in"
import { AddPattern } from "./add-pattern"
import { ListPatterns } from "./list-patterns"

export function Component() {
  useDocumentTitle("Chiveproxy Banner URL Patterns")

  return (
    <SignedIn>
      <Container>
        <ListPatterns />
        <AddPattern />
      </Container>
    </SignedIn>
  )
}
