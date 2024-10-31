import { Anchor, type AnchorProps } from "@mantine/core";
import { Link, type LinkProps, useLocation } from "wouter";

export function SmartAnchor({ ...props }: AnchorProps & LinkProps) {
  const [location] = useLocation();

  const { href, ...rest } = props;
  return (
    <Anchor
      component={Link}
      href={href}
      underline={location === href ? "never" : "always"}
      {...rest}
    />
  );
}
