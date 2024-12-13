import { Alert } from "@mantine/core"

export function DisplayError({ error }: { error?: Error | null }) {
  if (!error) return null
  return (
    <Alert variant="filled" color="red" title="Error">
      {error.message}
    </Alert>
  )
}

export function DisplayWarning({
  children,
  warning,
}: {
  children: React.ReactNode
  warning: string
}) {
  return (
    <Alert variant="light" color="orange" title={warning}>
      {children}
    </Alert>
  )
}
