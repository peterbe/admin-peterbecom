import {
  Alert,
  Button,
  Group,
  MultiSelect,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { API_BASE } from "../../config";
import { useCategories } from "../../hooks/use-categories";
import type { EditBlogitemT } from "../../types";
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
// type Posted = PostedSuccess | PostedError;

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
  // const [submittedValues, setSubmittedValues] = useState<
  //   typeof form.values | null
  // >(null);

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
      } else if (response.status === 201) {
        const json = (await response.json()) as PostedSuccess;
        // console.log("VALIDATION ERRORS", json);
        if (json.blogitem.oid !== blogitem.oid) {
          // redirect to the new oid
          throw new Error(`redirect to:: ${json.blogitem.oid}`);
          // return;
        }
        console.log("CREATED!", json.blogitem);
      } else if (response.status === 200) {
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

  // useEffect(() => {
  //   if (submittedValues === null) return;
  //   mutation.mutate(submittedValues);
  // }, [submittedValues]);

  return (
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
        autosize
        minRows={20}
        maxRows={35}
        // styles={{ fontFamily: "monospace" }}
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

      {categoriesError && <Alert color="red">Failed to load categories</Alert>}
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
        // withAsterisk
        label="Display format"
        key={form.key("display_format")}
        {...form.getInputProps("display_format")}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
}
function slugify(s: string) {
  return s
    .trim()
    .replace(/[#\s]+/g, "-")
    .replace(/[@/'?]/g, "")
    .toLowerCase();
}
