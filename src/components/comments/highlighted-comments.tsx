import { Container } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { SignedIn } from "../signed-in"
import { HighlightedCommentsTable } from "./highlighted-comments-table"

export default function HighlightedComments() {
  useDocumentTitle("Highlighted Comments")
  return (
    <SignedIn>
      <Container>
        <HighlightedCommentsTable />
      </Container>
    </SignedIn>
  )
}
