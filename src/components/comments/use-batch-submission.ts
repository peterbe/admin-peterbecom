import { useState } from "react";

export function useBatchSubmission() {
  const [toApprove, setToApprove] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<string[]>([]);

  const [approved, setApproved] = useState<string[]>([]);
  const [deleted, setDeleted] = useState<string[]>([]);

  function toggleToApprove(oid: string) {
    if (toApprove.includes(oid)) {
      setToApprove((prev) => prev.filter((o) => o !== oid));
    } else {
      setToApprove([...toApprove, oid]);
    }
    setToDelete((prev) => prev.filter((o) => o !== oid));
  }

  function toggleToDelete(oid: string) {
    if (toDelete.includes(oid)) {
      setToDelete((prev) => prev.filter((o) => o !== oid));
    } else {
      setToDelete([...toDelete, oid]);
    }
    setToApprove((prev) => prev.filter((o) => o !== oid));
  }

  function reset() {
    setToApprove([]);
    setToDelete([]);
  }

  return {
    toApprove,
    toggleToApprove,
    toDelete,
    toggleToDelete,
    reset,
    approved,
    deleted,
    setApproved,
    setDeleted,
  };
}
