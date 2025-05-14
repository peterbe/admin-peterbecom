import {
  Alert,
  Button,
  Card,
  Container,
  CopyButton,
  Group,
} from "@mantine/core"
import { useState } from "react"
import { type VideoT, useVideos } from "../../hooks/use-videos"
import { useAbsoluteBaseUrl } from "./use-absolute-base-url"

export function VideoThumbnails({ oid }: { oid: string }) {
  const [show, setShow] = useState(false)
  const { data, error } = useVideos(oid)
  const baseUrl = useAbsoluteBaseUrl()
  if (error) {
    return (
      <Container>
        <Alert color="red" title="Image thumbnails errors">
          {error.message}
        </Alert>
      </Container>
    )
  }
  if (data?.videos.length) {
    if (show) {
      return (
        <Container>
          <Group justify="right">
            <Button onClick={() => setShow(false)} size="xs">
              Close
            </Button>
            <Group>
              {data.videos.map((video) => (
                <VideoThumbnail
                  key={video.id}
                  video={video}
                  baseUrl={baseUrl}
                />
              ))}
            </Group>
          </Group>
        </Container>
      )
    }
    return (
      <Button onClick={() => setShow(true)} size="xs">
        Show videos ({data.videos.length})
      </Button>
    )
  }
  return null
}

function VideoThumbnail({
  video,
  baseUrl,
}: {
  video: VideoT
  baseUrl: string
}) {
  let html = `<video controls poster="${video.thumbnails.bigger.url}" style="max-width:100%">\n`
  html += Object.values(video.formats)
    .map(({ url, type }) => `  <source src="${url}" type="${type}"/>`)
    .join("\n")
  html += "\n  Download the "
  html += Object.values(video.formats)
    .map(({ url, type }) => `<a href="${url}">${type}</a>`)
    .join(" or ")
  html += "\n</video>"

  const htmlBigger = html
  const htmlFull = html.replace(
    video.thumbnails.bigger.url,
    video.thumbnails.full.url,
  )

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <video
          controls
          poster={`${baseUrl}${video.thumbnails.bigger.url}`}
          style={{ maxWidth: 300 }}
        >
          {Object.entries(video.formats).map(([format, { url, type }]) => (
            <source key={format} src={`${baseUrl}${url}`} type={type} />
          ))}
        </video>
      </Card.Section>
      <Group gap="xs">
        <CopyButton value={htmlBigger}>
          {({ copied, copy }) => (
            <Button
              variant={copied ? "filled" : "default"}
              color={copied ? "green" : undefined}
              // size="xs"
              onClick={copy}
            >
              {copied ? "Copied" : "HTML (bigger)"}
            </Button>
          )}
        </CopyButton>
        <CopyButton value={htmlFull}>
          {({ copied, copy }) => (
            <Button
              variant={copied ? "filled" : "default"}
              color={copied ? "green" : undefined}
              onClick={copy}
            >
              {copied ? "Copied" : "HTML (full)"}
            </Button>
          )}
        </CopyButton>
      </Group>
    </Card>
  )
}
