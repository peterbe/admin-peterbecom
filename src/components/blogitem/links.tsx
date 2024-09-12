import { Anchor, Box, Group } from "@mantine/core";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export function BlogitemLinks({ oid }: { oid: string }) {
  return (
    <Box>
      <Group justify="right">
        <Anchor component={Link} href={`/plog/${oid}`}>
          Edit
        </Anchor>
        <Anchor component={Link} href={`/plog/${oid}/images`}>
          Images
        </Anchor>
        <Anchor component={Link} href={`/plog/${oid}/open-graph-image`}>
          Open Graph Image
        </Anchor>
        <PublicURL path={`/plog/${oid}`}>View</PublicURL>
      </Group>
    </Box>
  );
}

function PublicURL({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const [url, setUrl] = useState<URL>(new URL(path, "https://www.peterbe.com"));

  useEffect(() => {
    if (window.location.hostname === "localhost") {
      setUrl(new URL(path, "http://localhost:3000"));
    }
  }, [path]);

  return (
    <Anchor href={url.toString()} target="_blank">
      {children}
    </Anchor>
  );
}
