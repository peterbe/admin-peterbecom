import { Anchor, Box, Group, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useImages } from "../../hooks/use-images";
import { useOpenGraphImages } from "../../hooks/use-open-graph-images";

export function BlogitemLinks({ oid }: { oid: string }) {
  const images = useImages(oid);
  const openGraphImages = useOpenGraphImages(oid);
  return (
    <Box mt={10} mb={20}>
      <Group justify="right">
        <Anchor component={Link} href={`/plog/${oid}`}>
          Edit
        </Anchor>
        <Anchor component={Link} href={`/plog/${oid}/images`}>
          Images {images.data && `(${images.data.images.length})`}
        </Anchor>
        <Anchor component={Link} href={`/plog/${oid}/open-graph-image`}>
          Open Graph Image{" "}
          {openGraphImages?.data?.images.some((img) => img.current) && (
            <Text size="xs" span>
              (picked)
            </Text>
          )}
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
