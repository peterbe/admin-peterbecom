import { Alert, Box, LoadingOverlay, Paper, Title } from "@mantine/core";
import type { PreviewData } from "../../types";
import "./highlight.js.css"; // for the previ

export function Preview({
  data,
  error,
  isPending,
}: {
  data?: PreviewData;
  error: Error | null;
  isPending: boolean;
}) {
  if (!data && !error && !isPending) return null;
  return (
    <Box pos="relative" mt={20}>
      <Paper shadow="sm" withBorder p="xl">
        <Title order={3}>Preview</Title>
        <LoadingOverlay visible={isPending} />
        {error && <Alert color="red">{error.message}</Alert>}
        {data?.blogitem.errors && (
          <Alert color="red" title="Failed to preview">
            <pre>{JSON.stringify(data.blogitem.errors, undefined, 2)}</pre>
          </Alert>
        )}
        {data?.blogitem.html && (
          <Paper
            bg="var(--mantine-color-gray-1)"
            radius="sm"
            shadow="xs"
            pt={2}
            pb={2}
            pl={10}
            pr={10}
            dangerouslySetInnerHTML={{ __html: data.blogitem.html }}
          />
        )}
      </Paper>
    </Box>
  );
}
