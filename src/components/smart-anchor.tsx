import { Anchor } from "@mantine/core";
import { Link, useLocation } from "wouter";

export function SmartAnchor({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [location] = useLocation();

  return (
    <Anchor
      component={Link}
      href={href}
      underline={location === href ? "never" : "always"}
    >
      {children}
    </Anchor>
  );
}
