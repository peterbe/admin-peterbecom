import { useDocumentTitle } from "@mantine/hooks";
import { useParams } from "wouter";

import { SignedIn } from "../signed-in";

export default function Blogitem() {
  useDocumentTitle("Blogitem");
  const params = useParams();
  console.log("PARAMS", params);

  return <SignedIn>BLOGITEM HERE</SignedIn>;
}
