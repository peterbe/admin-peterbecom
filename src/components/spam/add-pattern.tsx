import {
  Alert,
  Box,
  Button,
  Checkbox,
  LoadingOverlay,
  Stack,
  TextInput,
  Title,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { API_BASE } from "../../config"
import { spamPatternsQueryKey } from "../api-utils"

type PostedError = {
  errors: Record<string, string | string[]>
}

export function AddPattern() {
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = useMutation({
    mutationKey: spamPatternsQueryKey(),
    mutationFn: async (data: typeof form.values) => {
      const url = `${API_BASE}/plog/spam/patterns`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.status === 400) {
        const json = (await response.json()) as PostedError
        notifications.show({
          title: "Validation errors",
          message: "Look for red",
          color: "red",
        })
        for (const [field, errors] of Object.entries(json.errors)) {
          form.setFieldError(
            field,
            Array.isArray(errors) ? errors.join(", ") : errors,
          )
        }
      } else if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
    },
    onSuccess: () => {
      notifications.show({
        message: "Spam pattern added",
        color: "green",
      })

      form.reset()
      form.setValues(initialValues)

      queryClient.invalidateQueries({
        queryKey: spamPatternsQueryKey(),
      })
    },
  })

  const initialValues = {
    pattern: "",
    is_regex: false,
    is_url_pattern: false,
  }

  const form = useForm({
    mode: "uncontrolled",
    initialValues,
  })

  return (
    <Box mb={10} pos="relative">
      <Title order={4}>Add New Pattern</Title>
      <LoadingOverlay visible={isPending} />

      {error && <Alert color="red">Error: {error.message}</Alert>}

      <form
        onSubmit={form.onSubmit((data) => {
          if (data !== null) {
            mutate(data)
          }
        })}
      >
        <Stack>
          <TextInput
            label="Pattern"
            placeholder="Pattern"
            key={form.key("pattern")}
            {...form.getInputProps("pattern")}
          />

          <Checkbox
            label="Regex?"
            key={form.key("is_regex")}
            {...form.getInputProps("is_regex")}
          />

          <Checkbox
            label="URL pattern?"
            key={form.key("is_url_pattern")}
            {...form.getInputProps("is_url_pattern")}
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
        </Stack>
      </form>
    </Box>
  )
}
