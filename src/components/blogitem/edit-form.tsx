import {
  Alert,
  Box,
  Button,
  MultiSelect,
  SimpleGrid,
  TextInput,
  Textarea,
  Tooltip,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { API_BASE } from "../../config"
import { useCategories } from "../../hooks/use-categories"
import type { EditBlogitemT } from "../../types"
import "./highlight.js.css" // for the preview
import {
  useDebouncedValue,
  useHotkeys,
  useThrottledCallback,
} from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { useNavigate } from "react-router"
import {
  blogitemQueryKey,
  blogitemsQueryKey,
  blogitemsShowAllQueryKey,
} from "../api-utils"
import classes from "./edit-form.module.css"
import { ImageThumbnails } from "./image-thumbnails"
import { Preview } from "./preview"

function list2string(list: string[]) {
  return list
    .filter((s) => s.trim() !== "")
    .map((s) => s.trim())
    .join("\n")
}

function required(v: string) {
  return v.trim() ? null : "Required"
}

function validUrl(v: string) {
  return !/\s/.test(v.trim()) && URL.canParse(v.trim())
}

type PostedSuccess = {
  blogitem: {
    id: number
    oid: string
  }
}
type PostedError = {
  errors: Record<string, string | string[]>
}

export function Form({ blogitem }: { blogitem: EditBlogitemT }) {
  const {
    categories,
    isPending: categorisIsPending,
    error: categoriesError,
  } = useCategories()

  const initialValues = {
    oid: blogitem.oid,
    title: blogitem.title,
    text: blogitem.text,
    summary: blogitem.summary,
    url: blogitem.url,
    pub_date: blogitem.pub_date,
    keywords: list2string(blogitem.keywords),
    categories: blogitem.categories.map((category) => `${category.id}`),
    display_format: blogitem.display_format,
  }

  const [previewText, setPreviewText] = useState(blogitem.text)
  const [debouchedPreviewText] = useDebouncedValue(previewText, 1000)

  const form = useForm({
    // https://mantine.dev/form/uncontrolled/#uncontrolled-mode
    // Recommended mode.
    mode: "uncontrolled",
    initialValues,
    validate: {
      oid: required,
      title: required,
      text: required,
      url: (v) => {
        if (!v || validUrl(v)) return null
        return "Invalid URL"
      },
    },

    onValuesChange: (values) => {
      const { title, oid, text } = values

      setPreviewText(text)

      // blogitem.id will be 0 when it's for adding a new one
      if (!blogitem.id && title) {
        if (!form.isTouched("oid") || !oid) {
          form.setFieldValue("oid", slugify(title))
          form.setTouched({ oid: false })
        }
      }
    },
  })

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // I *think* this works
      if (form.isDirty() && form.isTouched()) {
        event.preventDefault()
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [form])

  function suggestSummary() {
    const text = form.getValues().text
    if (text) {
      let summary = text.trim().split(/\n\n+/)[0]
      while (summary.startsWith("*") && summary.endsWith("*")) {
        summary = summary.slice(1, summary.length - 1)
      }

      form.setFieldValue("summary", summary)
    }
  }

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: typeof form.values) => {
      const url = `${API_BASE}/plog/${blogitem.id ? blogitem.oid : ""}`
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
      } else if (response.status === 201) {
        notifications.show({
          message: "Blogitem created",
          color: "green",
        })
        const json = (await response.json()) as PostedSuccess
        if (json.blogitem.oid !== blogitem.oid) {
          // redirect to the new oid
          navigate(`/plog/${json.blogitem.oid}`)
          return
        }
      } else if (response.status === 200) {
        notifications.show({
          message: "Blogitem updated",
          color: "green",
        })
        const json = (await response.json()) as { blogitem: EditBlogitemT }
        if (json.blogitem.oid !== blogitem.oid) {
          // redirect to the new oid
          navigate(`/plog/${json.blogitem.oid}`)
        }
      } else {
        throw new Error(`${response.status} on ${response.url}`)
      }
    },
    onSuccess: () => {
      form.resetTouched()
      form.resetDirty()

      queryClient.invalidateQueries({
        queryKey: blogitemQueryKey(blogitem.oid),
      })
      queryClient.invalidateQueries({ queryKey: blogitemsQueryKey() })
      queryClient.invalidateQueries({ queryKey: blogitemsShowAllQueryKey() })
    },
  })

  const saveButtonRef = useRef<HTMLButtonElement>(null)

  const triggerSave = () => {
    if (saveButtonRef.current) {
      saveButtonRef.current.click()
    } else {
      notifications.show({
        title: "Can't save",
        message: "Form not ready to be saved",
        color: "red",
      })
    }
  }

  useHotkeys([["mod+S", triggerSave]])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [textareaScrollPosition, setTextareaScrollPosition] = useState<
    null | number
  >(null)
  const throttledSetTextareaScrollPosition = useThrottledCallback(
    (value) => setTextareaScrollPosition(value),
    1050,
  )

  function textareaScrollHandler(event: React.UIEvent<HTMLTextAreaElement>) {
    const { scrollHeight, scrollTop } = event.currentTarget
    const offset = textareaRef.current?.clientHeight || 0 // height of textarea
    if (scrollHeight <= Math.ceil(scrollTop + offset)) {
      throttledSetTextareaScrollPosition(scrollTop + offset)
    } else {
      throttledSetTextareaScrollPosition(scrollTop)
    }
  }

  function previewScrollHandler() {
    setTextareaScrollPosition(null)
  }

  return (
    <div>
      {mutation.isError && (
        <Alert color="red" title="Failed to save changes">
          {mutation.error.message}
        </Alert>
      )}

      {Boolean(blogitem.id) && <ImageThumbnails oid={blogitem.oid} />}

      <form
        onSubmit={form.onSubmit((data) => {
          if (data !== null) {
            mutation.mutate(data)
          }
        })}
      >
        <TextInput
          withAsterisk
          label="Title"
          placeholder="Title"
          key={form.key("title")}
          {...form.getInputProps("title")}
        />
        <TextInput
          withAsterisk
          label="OID"
          placeholder="oid slug"
          key={form.key("oid")}
          {...form.getInputProps("oid")}
        />
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          <Textarea
            withAsterisk
            label="Text"
            className="markdown-textarea"
            key={form.key("text")}
            ref={textareaRef}
            {...form.getInputProps("text")}
            onBlur={() => {
              setPreviewText(form.getValues().text.trim())
            }}
            onScroll={textareaScrollHandler}
            autosize
            minRows={20}
            maxRows={35}
            classNames={{ input: classes.input }}
          />
          <Preview
            previewText={debouchedPreviewText}
            displayFormat={form.getValues().display_format}
            onScroll={previewScrollHandler}
            scrollPosition={
              textareaScrollPosition === null
                ? undefined
                : textareaScrollPosition
            }
          />
        </SimpleGrid>

        <Textarea
          label="Summary"
          key={form.key("summary")}
          {...form.getInputProps("summary")}
          autosize
          minRows={2}
          maxRows={6}
        />
        {!form.getValues().summary && form.getValues().text && (
          <Button size="xs" variant="subtle" onClick={suggestSummary}>
            Suggest summary
          </Button>
        )}
        <TextInput
          label="URL"
          type="url"
          key={form.key("url")}
          {...form.getInputProps("url")}
        />
        <TextInput
          label="Pub date"
          key={form.key("pub_date")}
          {...form.getInputProps("pub_date")}
        />

        {categoriesError && (
          <Alert color="red">Failed to load categories</Alert>
        )}
        <MultiSelect
          label={
            categoriesError
              ? "Categories (errored!)"
              : categorisIsPending
                ? "Categories (loading)"
                : "Categories"
          }
          comboboxProps={{ shadow: "md" }}
          disabled={categories.length === 0}
          data={categories.map((category) => ({
            value: `${category.id}`,
            label: category.name,
          }))}
          {...form.getInputProps("categories")}
        />

        <Textarea
          label="Keywords"
          key={form.key("keywords")}
          {...form.getInputProps("keywords")}
          onBlur={() => {
            const { keywords } = form.getValues()
            const clean = list2string(keywords.split("\n"))
            if (clean !== keywords) {
              form.setFieldValue("keywords", clean)
            }
          }}
          autosize
          minRows={3}
          maxRows={6}
        />

        <TextInput
          label="Display format"
          key={form.key("display_format")}
          {...form.getInputProps("display_format")}
        />

        <Box mt={10}>
          <Tooltip label="Keyboard shortcut: ⌘+S">
            <Button
              type="submit"
              fullWidth
              disabled={mutation.isPending}
              loading={mutation.isPending}
              ref={saveButtonRef}
            >
              Save
            </Button>
          </Tooltip>
        </Box>
      </form>
    </div>
  )
}

function slugify(s: string) {
  return s
    .trim()
    .replace(/[#\s]+/g, "-")
    .replace(/[@/'?<>!]/g, "")
    .toLowerCase()
}
