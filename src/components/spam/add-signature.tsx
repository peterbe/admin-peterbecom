import {
  Alert,
  Box,
  Button,
  Checkbox,
  LoadingOverlay,
  TextInput,
  Title,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { API_BASE } from "../../config"
import { spamSignaturesQueryKey } from "../api-utils"

type PostedError = {
  errors: Record<string, string | string[]>
}

export function AddSignature() {
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = useMutation({
    mutationKey: spamSignaturesQueryKey(),
    mutationFn: async (data: typeof form.values) => {
      const url = `${API_BASE}/spam/signatures`
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
      } else if (response.status === 200) {
        notifications.show({
          message: "Spam signature added",
          color: "green",
        })
      } else {
        throw new Error(`${response.status} on ${response.url}`)
      }
    },
    onSuccess: () => {
      form.reset()
      form.setValues(initialValues)

      queryClient.invalidateQueries({
        queryKey: spamSignaturesQueryKey(),
      })
    },
  })

  const initialValues = {
    name: "",
    name_null: false,
    email: "",
    email_null: false,
  }

  const form = useForm({
    mode: "uncontrolled",
    initialValues,
  })

  return (
    <Box mb={10} pos="relative">
      <Title order={4}>Add New Signature</Title>
      <LoadingOverlay visible={isPending} />

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
          placeholder="Name"
          key={form.key("name")}
          {...form.getInputProps("name")}
        />

        <Checkbox
          label="Empty means null"
          key={form.key("name_null")}
          {...form.getInputProps("name_null")}
          disabled={form.getValues().name !== ""}
        />

        <TextInput
          label="Email"
          placeholder="Email"
          key={form.key("email")}
          {...form.getInputProps("email")}
        />
        <Checkbox
          label="Empty means null"
          key={form.key("email_null")}
          {...form.getInputProps("email_null")}
          disabled={form.getValues().email !== ""}
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
