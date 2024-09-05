import {
  Alert,
  Box,
  Button,
  Group,
  LoadingOverlay,
  MultiSelect,
  Paper,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { API_BASE } from "../../config";
import { useCategories } from "../../hooks/use-categories";
import type { EditBlogitemT } from "../../types";
import "./highlight.js.css"; // for the preview
import { notifications } from "@mantine/notifications";
import classes from "./edit-form.module.css";

function list2string(list: string[]) {
  return list.filter((s) => s.trim() !== "").join("\n");
}

function required(v: string) {
  return v.trim() ? null : "Required";
}

function validUrl(v: string) {
  return !/\s/.test(v.trim()) && URL.canParse(v.trim());
}

type PostedSuccess = {
  blogitem: {
    id: number;
    oid: string;
  };
};
type PostedError = {
  errors: Record<string, string[]>;
};

type PreviewData = {
  blogitem: {
    html?: string;
    errors?: Record<string, string[]>;
  };
};

export function Form({ blogitem }: { blogitem: EditBlogitemT }) {
  const { categories, error: categoriesError } = useCategories();

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
  };
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
        if (!v || validUrl(v)) return null;
        return "Invalid URL";
      },
    },
    onValuesChange: (values) => {
      const { title, oid } = values;
      // blogitem.id will be 0 when it's for adding a new one
      if (!blogitem.id && title) {
        if (!form.isTouched("oid") || !oid) {
          form.setFieldValue("oid", slugify(title));
          form.setTouched({ oid: false });
        }
      }
    },
  });

  function suggestSummary() {
    const text = form.getValues().text;
    if (text) {
      let summary = text.trim().split(/\n\n+/)[0];
      while (summary.startsWith("*") && summary.endsWith("*")) {
        summary = summary.slice(1, summary.length - 1);
      }

      form.setFieldValue("summary", summary);
    }
  }

  const mutation = useMutation({
    mutationFn: async (data: typeof form.values) => {
      console.log("POST THIS:", data);
      // return Promise.resolve(null);
      const url = `${API_BASE}/plog/${blogitem.id ? blogitem.oid : ""}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log("RESPONSE:", response);

      if (response.status === 400) {
        const json = (await response.json()) as PostedError;
        console.log("VALIDATION ERRORS", json);
        notifications.show({
          title: "Validation errors",
          message: "Look for red",
          color: "red",
        });
        for (const [field, errors] of Object.entries(json.errors)) {
          form.setFieldError(field, errors.join(", "));
        }

        // throw new ValidationError("Validation error");
      }
      if (response.status === 201) {
        notifications.show({
          message: "Blogitem created",
          color: "green",
        });
        const json = (await response.json()) as PostedSuccess;
        // console.log("VALIDATION ERRORS", json);
        if (json.blogitem.oid !== blogitem.oid) {
          // redirect to the new oid
          throw new Error(`redirect to:: ${json.blogitem.oid}`);
          // return;
        }
        console.log("CREATED!", json.blogitem);
      } else if (response.status === 200) {
        notifications.show({
          message: "Blogitem updated",
          color: "green",
        });
        const json = (await response.json()) as { blogitem: EditBlogitemT };
        // console.log("VALIDATION ERRORS", json);
        if (json.blogitem.oid !== blogitem.oid) {
          // redirect to the new oid
          throw new Error(`redirect to:: ${json.blogitem.oid}`);
          // return;
        }
        console.log("UPDATED", json.blogitem);
      } else {
        // if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
        // }
      }

      // return axios.post('/todos', newTodo)
    },
  });

  const [previewText, setPreviewText] = useState("");

  const preview = useQuery<PreviewData>({
    queryKey: ["preview", previewText],
    // retry: (failureCount, error) => {
    //   console.log("IN RETRY FUNCTION", error);
    //   if (error instanceof ValidationError) {
    //     // Don't retry on validation errors
    //     return false;
    //   }
    //   console.log({ failureCount });
    //   return failureCount < 3;
    // },
    queryFn: async () => {
      if (!previewText) return Promise.resolve(null);
      const response = await fetch(`${API_BASE}/plog/preview/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: previewText,
          title: form.getValues().title,
          categories: form.getValues().categories,
          display_format: form.getValues().display_format,
        }),
      });

      if (response.ok || response.status === 400) {
        return response.json();
      }
      throw new Error(`${response.status} on ${response.url}`);
    },
  });

  return (
    <div>
      {mutation.isError && (
        <Alert color="red" title="Failed to save changes">
          {mutation.error.message}
        </Alert>
      )}

      <form
        // onSubmit={(event) => event.preventDefault()}
        onSubmit={form.onSubmit((data) => {
          if (data !== null) mutation.mutate(data);
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
        <Textarea
          withAsterisk
          label="Text"
          key={form.key("text")}
          {...form.getInputProps("text")}
          onBlur={() => {
            setPreviewText(form.getValues().text.trim());
          }}
          autosize
          minRows={20}
          maxRows={35}
          classNames={{ input: classes.input }}
        />
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
          label="Categories"
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
          autosize
          minRows={3}
          maxRows={6}
        />

        <TextInput
          label="Display format"
          key={form.key("display_format")}
          {...form.getInputProps("display_format")}
        />

        <Group justify="flex-end" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>

      <Preview
        data={preview.data}
        error={preview.error}
        isPending={preview.isPending}
      />
    </div>
  );
}

function slugify(s: string) {
  return s
    .trim()
    .replace(/[#\s]+/g, "-")
    .replace(/[@/'?]/g, "")
    .toLowerCase();
}

function Preview({
  data,
  error,
  isPending,
}: {
  data?: PreviewData;
  error: Error | null;
  isPending: boolean;
}) {
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
            bg="var(--mantine-color-gray-2)"
            radius="sm"
            pt={2}
            pl={10}
            pr={10}
            dangerouslySetInnerHTML={{ __html: data.blogitem.html }}
          />
        )}
      </Paper>
    </Box>
  );
}
