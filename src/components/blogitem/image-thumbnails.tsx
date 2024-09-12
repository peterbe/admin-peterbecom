import { Alert, Badge, Box, Button, Card, Group, Text } from "@mantine/core";
import { useState } from "react";
import { type ImageT, useImages } from "../../hooks/use-images";
import { AbsoluteImage } from "./absolute-image";

export function ImageThumbnails({ oid }: { oid: string }) {
  const [show, setShow] = useState(false);
  const images = useImages(oid);
  if (images.error) {
    return (
      <Alert color="red" title="Image thumbnails errors">
        {images.error.message}
      </Alert>
    );
  }
  if (images.data) {
    if (show) {
      return (
        <Box>
          <Button onClick={() => setShow(false)} size="xs">
            Close
          </Button>
          <Group>
            {images.data.images.map((image) => (
              <ImageThumbnail key={image.full_url} image={image} />
            ))}
          </Group>
        </Box>
      );
    }
    return (
      <Button onClick={() => setShow(true)} size="xs">
        Show image thumbnails ({images.data.images.length})
      </Button>
    );
  }
  return null;
}

function ImageThumbnail({ image }: { image: ImageT }) {
  const sizes = ["small", "big", "bigger"] as const;
  return sizes.map((size) => {
    return (
      <Card key={size} shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <AbsoluteImage
            src={image[size].url}
            alt={image[size].alt || ""}
            w={200}
          />
        </Card.Section>

        <Group justify="space-between" mt="md" mb="xs">
          <Text fw={500}>
            {image[size].width}x{image[size].height}
          </Text>
          <Badge>{size}</Badge>
        </Group>
        {image[size].alt && (
          <Text size="sm" c="dimmed">
            {image[size].alt}
          </Text>
        )}

        <Group>
          <Button variant="default" size="xs">
            URL
          </Button>
          <Button variant="default" size="xs">
            Image tag
          </Button>
          <Button variant="default" size="xs">
            Whole tag
          </Button>
        </Group>
      </Card>
    );
  });
}
