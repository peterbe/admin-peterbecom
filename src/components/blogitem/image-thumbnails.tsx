import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  CopyButton,
  Group,
  Text,
} from "@mantine/core"
import { useState } from "react"
import { type ImageT, useImages } from "../../hooks/use-images"
import { AbsoluteImage } from "./absolute-image"

export function ImageThumbnails({ oid }: { oid: string }) {
  const [show, setShow] = useState(false)
  const images = useImages(oid)
  if (images.error) {
    return (
      <Container>
        <Alert color="red" title="Image thumbnails errors">
          {images.error.message}
        </Alert>
      </Container>
    )
  }
  if (images.data?.images.length) {
    if (show) {
      return (
        <Container>
          <Group justify="right">
            <Button onClick={() => setShow(false)} size="xs">
              Close
            </Button>
            <Group>
              {images.data.images.map((image) => (
                <ImageThumbnail key={image.full_url} image={image} />
              ))}
              {/* <ImageFullThumbnail image={image} /> */}
            </Group>
          </Group>
        </Container>
      )
    }
    return (
      <Button onClick={() => setShow(true)} size="xs">
        Show image thumbnails ({images.data.images.length})
      </Button>
    )
  }
  return null
}

function ImageThumbnail({ image }: { image: ImageT }) {
  // const sizes = ["small", "big", "bigger"] as const
  const sizes = ["big", "bigger"] as const

  const bySizes = sizes.map((size) => {
    const thumb = image[size]
    const imageTagHtml = `
    <img src="${thumb.url}" alt="${thumb.alt}" width="${thumb.width}" height="${thumb.height}">
    `.trim()
    const aTagHtml = `
    <a href="${image.full_url}">${imageTagHtml.replace(
      "width=",
      'class="floatright" width=',
    )}</a>
    `.trim()

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

        <Group gap="xs">
          <CopyButton value={aTagHtml}>
            {({ copied, copy }) => (
              <Button
                variant={copied ? "filled" : "default"}
                color={copied ? "green" : undefined}
                size="xs"
                onClick={copy}
              >
                {copied ? "Copied" : "Whole tag"}
              </Button>
            )}
          </CopyButton>
        </Group>
      </Card>
    )
  })

  let alt = ""
  for (const value of Object.values(image)) {
    if (typeof value === "object" && "alt" in value && value.alt) {
      alt = value.alt
      break
    }
  }

  const fullSizeHtml = `
    <a href="${image.full_url}"><img src="${image.full_url}" class="fullsize"></a>
    `.trim()

  console.log(image.full_size)

  bySizes.push(
    <Card key="full" shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <AbsoluteImage src={image.full_url} alt={alt} w={200} />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>
          {" "}
          {image.full_size[0]}x{image.full_size[1]}{" "}
        </Text>
        <Badge>Full</Badge>
      </Group>

      {alt && (
        <Text size="sm" c="dimmed">
          {alt}
        </Text>
      )}

      <Group gap="xs">
        <CopyButton value={fullSizeHtml}>
          {({ copied, copy }) => (
            <Button
              variant={copied ? "filled" : "default"}
              color={copied ? "green" : undefined}
              size="xs"
              onClick={copy}
            >
              {copied ? "Copied" : "Full size"}
            </Button>
          )}
        </CopyButton>
      </Group>
    </Card>,
  )

  return bySizes
}
