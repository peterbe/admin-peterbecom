import {
  Alert,
  Box,
  Group,
  Loader,
  LoadingOverlay,
  ScrollArea,
  Text,
} from "@mantine/core";
import type { PreviewData } from "../../types";
import "./highlight.js.css"; // for the preview
import { useQuery } from "@tanstack/react-query";
import { postPreview } from "./post-preview";

export function Preview({
  previewText,
  displayFormat,
}: {
  previewText: string;
  displayFormat: string;
}) {
  const { data, error, isFetching, isPending } = useQuery<PreviewData>({
    queryKey: ["preview", previewText, displayFormat],
    queryFn: async () => {
      if (!previewText) return Promise.resolve(null);

      return postPreview({
        text: previewText,
        displayFormat,
      });
    },
  });

  return (
    <Box pos="relative" style={{ minHeight: 100 }}>
      <Group>
        <Text>Preview</Text>
        {isFetching && <Loader color="gray" size="xs" type="dots" />}
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
          bg="var(--mantine-color-gray-0)"
          bd={"1px solid var(--mantine-color-gray-3)"}
          h={800}
          pt={2}
          pb={2}
          pl={10}
          pr={10}
        >
          <div dangerouslySetInnerHTML={{ __html: data.blogitem.html }} />
        </ScrollArea>
      )}
    </Box>
  );
}
