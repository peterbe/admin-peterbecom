import {
  Alert,
  Box,
  Loader,
  LoadingOverlay,
  ScrollArea,
  Text,
} from "@mantine/core";
import type { PreviewData } from "../../types";
import "./highlight.js.css"; // for the preview

export function Preview({
  data,
  error,
  isPending,
  isFetching,
}: {
  data?: PreviewData;
  error: Error | null;
  isPending: boolean;
  isFetching: boolean;
}) {
  if (!data && !error && !isPending) return null;
  return (
    <Box pos="relative" style={{ minHeight: 100 }}>
      <Text>
        Preview {isFetching && <Loader color="gray" size="xs" type="dots" />}
      </Text>
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
