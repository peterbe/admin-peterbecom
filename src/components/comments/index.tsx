import { Container } from "@mantine/core";
import { SignedIn } from "../signed-in";
import { Tree } from "./tree";

export default function Comments() {
  return (
    <SignedIn>
      <Container>
        <Tree />
      </Container>
    </SignedIn>
  );
}
