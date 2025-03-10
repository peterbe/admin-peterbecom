import { Anchor, type AnchorProps } from "@mantine/core"

import { Link, type LinkProps, useLocation } from "react-router"

export function SmartAnchor({
  ...props
}: AnchorProps & Omit<LinkProps, "to"> & { href: string }) {
  const { href, ...rest } = props
  const { pathname } = useLocation()
  return (
    <Anchor
      {...rest}
      viewTransition
      component={Link}
      to={href}
      underline={pathname === href ? "never" : "always"}
    />
  )
}
