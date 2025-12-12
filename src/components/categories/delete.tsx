import { Alert, Box, Button, Group } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { API_BASE } from "../../config"
import { categoriesQueryKey } from "../api-utils"
import type { Category } from "./types"

export function Delete({
  category,
  onClose,
}: {
  category: Category
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const { isPending, error, mutate } = useMutation({
    mutationKey: ["delete-category", category.id],
    mutationFn: async () => {
      const url = `${API_BASE}/categories?id=${category.id}`
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
    },
    onSuccess: async () => {
      notifications.show({
        message: "Category deleted",
        color: "green",
      })
      onClose()
      await queryClient.invalidateQueries({
        queryKey: categoriesQueryKey(),
      })
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: `Failed to delete category: ${error.message}`,
        color: "red",
      })
    },
  })

  const [confirmed, setConfirmed] = useState(false)
  return (
    <Box>
      {error && <Alert color="red">Error: {error.message}</Alert>}

      <Group>
        {confirmed ? (
          <Button color="red" disabled={isPending} onClick={() => mutate()}>
            Yes
          </Button>
        ) : (
          <Button color="orange" onClick={() => setConfirmed(true)}>
            Are you sure?
          </Button>
        )}
        <Button onClick={onClose}>Cancel</Button>
      </Group>
    </Box>
  )
}
