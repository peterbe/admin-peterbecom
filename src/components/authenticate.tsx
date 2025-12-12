import { Alert, Container, Paper } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"

import { useSearchParams } from "react-router"
import { useUserData } from "../whoami/use-userdata"

export function Authenticate() {
  useDocumentTitle("Sign in")
  const { userData } = useUserData()

  return (
    <Container size={420} my={40}>
      {userData?.user && (
        <Alert>
          You&apos;re already signed in! <b>{userData.user.username}</b>
        </Alert>
      )}

      <SignIn />
    </Container>
  )
}

function SignIn() {
  const [searchParams] = useSearchParams()
  const sp = new URLSearchParams(searchParams)
  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <a
        href={`/oidc/authenticate/?${sp}`}
        onClick={(event) => {
          if (process.env.NODE_ENV === "test") {
            event.preventDefault()
            fetch(`/oidc/authenticate/?${sp}`, { method: "POST" })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`${response.status} on ${response.url}`)
                }
                // This is hacky and I don't like it.
                // biome-ignore lint/suspicious/noDocumentCookie: only used for automated testing
                document.cookie = "mocksessionid=mruser"
                window.location.href = "/?redirected=true"
              })
              .catch((error) => {
                console.error("Error during mock authentication:", error)
              })
          }
        }}
      >
        Sign in with OpenID Connect
      </a>
    </Paper>
  )
}
