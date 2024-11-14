import { Container } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { SignedIn } from "../signed-in"
import { Probe } from "./probe"
import { PurgeURLs } from "./purge-urls"

export function Component() {
  useDocumentTitle("CDN")

  return (
    <SignedIn>
      <Container>
        <Probe />
        <PurgeURLs />
      </Container>
    </SignedIn>
  )
}
