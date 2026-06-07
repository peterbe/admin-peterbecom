import { useDocumentTitle } from "@mantine/hooks"
import { SignedIn } from "../signed-in"
import { List } from "./list"

export function Component() {
  useDocumentTitle("LLM Calls")

  return (
    <SignedIn>
      <List />
    </SignedIn>
  )
}
