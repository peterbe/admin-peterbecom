import { Alert } from "@mantine/core"

export function DisplayError({ error }: { error?: Error }) {
  if (!error) return null
  return (
    <Alert variant="filled" color="red" title="Error">
      {error.message}
    </Alert>
  )
}
