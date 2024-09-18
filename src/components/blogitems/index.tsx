import { useDocumentTitle } from "@mantine/hooks";

import { Container } from "@mantine/core";
import { SignedIn } from "../signed-in";
import { List } from "./list";

export default function Blogitems() {
  useDocumentTitle("Blogitems");

  return (
    <SignedIn>
      <Container>
        <List />
      </Container>
    </SignedIn>
  );
}
