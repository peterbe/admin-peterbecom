import { Alert, Container, Paper } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useLocation } from "wouter";

import { useUserData } from "../hooks/use-userdata";

export function Authenticate() {
  useDocumentTitle("Sign in");
  const { userData } = useUserData();

  return (
    <Container size={420} my={35}>
      {userData?.user && (
        <Alert>
          You&apos;re already signed in! <b>{userData.user.username}</b>
        </Alert>
      )}

      <SignIn />
    </Container>
  );
}

function SignIn() {
  const [next] = useLocation();
  const sp = new URLSearchParams({ next });
  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <a href={`/oidc/authenticate/?${sp}`}>Sign in with OpenID Connect</a>
    </Paper>
  );
}
