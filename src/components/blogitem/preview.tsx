import {
  Alert,
  Box,
  Group,
  Loader,
  LoadingOverlay,
  ScrollArea,
  Text,
} from "@mantine/core"
import type { PreviewData } from "../../types"
import "./highlight.js.css" // for the preview
import "./preview.css" // for the preview
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { postPreview } from "./post-preview"
import { RefreshPreviewAreaHeight } from "./refresh-preview-area-height"

type ScrollAreaProps = React.ComponentProps<typeof ScrollArea>
type ScrollAreaOnScroll = ScrollAreaProps["onScrollPositionChange"]

export function Preview({
  previewText,
  displayFormat,
  onScroll,
  scrollPosition,
}: {
  previewText: string
  displayFormat: string
  onScroll: ScrollAreaOnScroll
  scrollPosition?: number
}) {
  const { data, error, isFetching, isPending } = useQuery<PreviewData>({
    queryKey: ["preview", previewText, displayFormat],
    queryFn: async () => {
      if (!previewText) return null

      return postPreview({
        text: previewText,
        displayFormat,
      })
    },
    placeholderData: keepPreviousData,
  })

  const viewport = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (viewport.current && scrollPosition !== null) {
      // viewport.current.scrollTo({ top: scrollPosition, behavior: "smooth" })
      viewport.current.scrollTo({ top: scrollPosition })
    }
  }, [scrollPosition])

  return (
    <Box pos="relative" style={{ minHeight: 100 }}>
      <Group>
        <Text>Preview</Text>
        {isFetching && !isPending && (
          <Loader color="gray" size="xs" type="dots" />
        )}
      </Group>
      <LoadingOverlay visible={isPending} />
      {error && <Alert color="red">{error.message}</Alert>}
      {data?.blogitem.errors && (
        <Alert color="red" title="Failed to preview">
          <pre>{JSON.stringify(data.blogitem.errors, undefined, 2)}</pre>
        </Alert>
      )}

      {data?.blogitem.html && (
        <ScrollArea
          className="markdown-preview"
          data-testid="preview"
          bg="var(--mantine-color-gray-0)"
          bd={"1px solid var(--mantine-color-gray-3)"}
          h={190}
          pt={2}
          pb={2}
          pl={10}
          pr={10}
          viewportRef={viewport}
          onScrollPositionChange={onScroll}
        >
          <div dangerouslySetInnerHTML={{ __html: data.blogitem.html }} />
        </ScrollArea>
      )}

      {data?.blogitem.html && <RefreshPreviewAreaHeight />}
    </Box>
  )
}
