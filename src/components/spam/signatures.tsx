import { Container } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { SignedIn } from "../signed-in";
import { AddSignature } from "./add-signature";
import { ListSignatures } from "./list-signatures";

export default function SpamSignatures() {
  useDocumentTitle("Spam Comment Signatures");

  return (
    <SignedIn>
      <Container>
        <ListSignatures />
        <AddSignature />
      </Container>
    </SignedIn>
  );
}
