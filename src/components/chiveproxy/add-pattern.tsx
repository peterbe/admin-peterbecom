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
import { API_URL, QUERY_KEY } from "./constants"

type PostedError = {
  errors: Record<string, string | string[]>
}

export function AddPattern() {
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = useMutation({
    mutationKey: QUERY_KEY,
    mutationFn: async (data: typeof form.values) => {
      const url = API_URL
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
    onSuccess: async () => {
      notifications.show({
        message: "Pattern added",
        color: "green",
      })

      form.reset()
      form.setValues(initialValues)

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      })
    },
  })

  const initialValues = {
    pattern: "",
    is_regex: false,
    case_insensitive: false,
  }

  const form = useForm({
    mode: "uncontrolled",
    initialValues,
  })

  const formPattern = form.getValues().pattern

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

          {formPattern && isGuessable(formPattern) && (
            <Button
              onClick={() => {
                form.setFieldValue("pattern", fixPattern(formPattern))
                form.setFieldValue("is_regex", true)
              }}
            >
              Fix?
            </Button>
          )}

          <Checkbox
            label="Is Regex"
            key={form.key("is_regex")}
            {...form.getInputProps("is_regex")}
          />

          <Checkbox
            label="Case Insensitive"
            key={form.key("case_insensitive")}
            {...form.getInputProps("case_insensitive")}
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

function fix(pattern: string): string | false {
  if (!isUrl(pattern)) {
    return false
  }

  const url = new URL(pattern)
  const { search } = url
  if (!search) return false

  const qs = new URLSearchParams(search)

  const innerUrl = qs.get("url")
  if (!innerUrl) return false
  if (!isUrl(innerUrl)) return false

  const innerUrlObj = new URL(innerUrl)
  const pathname = innerUrlObj.pathname
  const base = pathname.split("/")[pathname.split("/").length - 1]
  return base
    .replace(/[a-f0-9]{6}/g, "[a-f0-9]{6}")
    .replace(/\d{2,6}/g, "\\d+")
    .replace(/\./g, "\\.")
}

function isGuessable(pattern: string) {
  return fix(pattern) !== false
}

function fixPattern(pattern: string): string {
  const fixed = fix(pattern)
  if (fixed === false) {
    throw new Error("Pattern is not fixable")
  }
  return fixed
}

function isUrl(pattern: string) {
  try {
    new URL(pattern)
    return true
  } catch {
    return false
  }
}
