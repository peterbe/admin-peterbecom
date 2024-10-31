import { Alert, Box, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { batchSubmitComments } from "../api-utils";

type BatchSubmission = {
  approved: string[];
  deleted: string[];
};

export function BatchSubmit({
  toApprove,
  toDelete,
  setApproved,
  setDeleted,
  reset,
}: {
  toApprove: string[];
  toDelete: string[];
  setApproved: (oids: string[]) => void;
  setDeleted: (oids: string[]) => void;
  reset: () => void;
}) {
  const mutation = useMutation<BatchSubmission>({
    mutationKey: ["batch-submit"],
    mutationFn: async () => {
      return batchSubmitComments({ approve: toApprove, _delete: toDelete });
    },
    onSuccess: (result) => {
      let message = "";
      if (result.approved.length > 0) {
        message += `${result.approved.length} comment${
          result.approved.length === 1 ? "" : "s"
        } approved. `;
        setApproved(result.approved);
      }
      if (result.deleted.length > 0) {
        message += `${result.deleted.length} comment${
          result.deleted.length === 1 ? "" : "s"
        } deleted. `;
        setDeleted(result.deleted);
      }

      notifications.show({
        title: "Batch update complete",
        message,
        color: "green",
      });

      reset();
    },
  });

  function go() {
    if (toApprove.length === 0 && toDelete.length === 0) return;
    mutation.mutate();
  }

  return (
    <Box>
      <Button
        disabled={
          (toApprove.length === 0 && toDelete.length === 0) ||
          mutation.isPending
        }
        loading={mutation.isPending}
        size="md"
        fullWidth
        onClick={go}
      >
        Submit batch updates ({toApprove.length} to approve, {toDelete.length}{" "}
        to delete)
      </Button>
      {mutation.error && <Alert color="red">{mutation.error.toString()}</Alert>}
    </Box>
  );
}
