import { Alert, Box, Button, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { API_BASE } from "../../config"
import { categoriesQueryKey } from "../api-utils"
import type { Category } from "./types"

export function Edit({
  category,
  onClose,
}: {
  category: Category
  onClose: () => void
}) {
  const initialValues = {
    name: category.name,
    category: category.id,
  }

  const queryClient = useQueryClient()

  const { isPending, error, mutate } = useMutation({
    mutationKey: ["edit-category", category.id],
    mutationFn: async (data: typeof form.values) => {
      const url = `${API_BASE}/categories`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
    },
    onSuccess: async () => {
      notifications.show({
        message: "Category updated",
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
        message: `Failed to update category: ${error.message}`,
        color: "red",
      })
    },
  })

  const form = useForm({
    mode: "uncontrolled",
    initialValues,
  })
  return (
    <Box>
      {error && <Alert color="red">Error: {error.message}</Alert>}

      <form
        onSubmit={form.onSubmit((data) => {
          if (data !== null) {
            mutate(data)
          }
        })}
      >
        <TextInput
          label="Name"
          key={form.key("name")}
          {...form.getInputProps("name")}
        />

        <Box mt={10}>
          <Button
            type="submit"
            fullWidth
            disabled={isPending}
            loading={isPending}
          >
            Save
          </Button>
        </Box>
      </form>
    </Box>
  )
}
