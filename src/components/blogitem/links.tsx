import { Box, Container, Group, Text } from "@mantine/core"
import { useBlogitem } from "../../hooks/use-blogitem"
import { useImages } from "../../hooks/use-images"
import { useOpenGraphImages } from "../../hooks/use-open-graph-images"
import { useVideos } from "../../hooks/use-videos"
import { PublicURL } from "../public-url-link"
import { SmartAnchor } from "../smart-anchor"

export function BlogitemLinks({
  oid,
  isPhoto,
}: {
  oid: string
  isPhoto?: boolean
}) {
  const images = useImages(oid)
  const videos = useVideos(oid)
  const openGraphImages = useOpenGraphImages(oid)

  const { data } = useBlogitem(oid)
  const _isPhoto = isPhoto !== undefined ? isPhoto : data?.blogitem?.is_photo
  const viewPath = _isPhoto ? `/photos/${oid}` : `/plog/${oid}`
  return (
    <Container>
      <Box mt={10} mb={20}>
        <Group justify="right">
          <SmartAnchor href={`/plog/${oid}`}>Edit</SmartAnchor>
          <SmartAnchor href={`/plog/${oid}/images`}>
            Images {images.data && `(${images.data.images.length})`}
          </SmartAnchor>
          <SmartAnchor href={`/plog/${oid}/videos`}>
            Videos {videos.data && `(${videos.data.videos.length})`}
          </SmartAnchor>
          <SmartAnchor href={`/plog/${oid}/open-graph-image`}>
            Open Graph Image{" "}
            {openGraphImages?.data?.images.some((img) => img.current) && (
              <Text size="xs" span>
                (picked)
              </Text>
            )}
          </SmartAnchor>
          <PublicURL path={viewPath}>View</PublicURL>
        </Group>
      </Box>
    </Container>
  )
}
