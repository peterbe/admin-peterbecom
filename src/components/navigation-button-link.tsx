import { Button } from "@mantine/core"
import { Link, useLocation } from "react-router"

export function NavigationButtonLink({
  to,
  children,
}: {
  to: string
  children: React.ReactNode
}) {
  const { pathname } = useLocation()
  return (
    <Button
      component={Link}
      to={to}
      variant="subtle"
      color={pathname === to ? "gray" : undefined}
      viewTransition
      prefetch="intent"
    >
      {children}
    </Button>
  )
}
