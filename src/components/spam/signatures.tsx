import { Container } from "@mantine/core";
import { SignedIn } from "../signed-in";
import { AddSignature } from "./add-signature";
import { ListSignatures } from "./list-signatures";

export default function SpamSignatures() {
  return (
    <SignedIn>
      <Container>
        <ListSignatures />
        <AddSignature />
      </Container>
    </SignedIn>
  );
}
