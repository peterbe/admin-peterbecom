import { Box, Button, Text, Title } from "@mantine/core";

export function BatchSubmit({
  toApprove,
  toDelete,
}: {
  toApprove: string[];
  toDelete: string[];
}) {
  if (toApprove.length === 0 && toDelete.length === 0) {
    return null;
  }
  return (
    <Box>
      <Title order={3}>Batch submission</Title>
      <Text>{toApprove.length} to approve</Text>
      <Text>{toDelete.length} to delete</Text>
      <Button disabled={toApprove.length === 0 && toDelete.length === 0}>
        Submit batch updates
      </Button>
    </Box>
  );
}
