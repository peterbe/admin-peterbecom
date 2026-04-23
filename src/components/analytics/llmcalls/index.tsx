import { Container, Title } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { SignedIn } from "../../signed-in"
import { Sums } from "./sums"

export function Component() {
  useDocumentTitle("Analytics LLM Calls")
  return (
    <SignedIn>
      <Container>
        <Title mb={30}>Analytics LLM Calls</Title>
        <Sums />
      </Container>
    </SignedIn>
  )
}
