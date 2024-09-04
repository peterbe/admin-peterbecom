import { Button, Group, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import type { EditBlogitemT } from "../../types";

export function Form({ blogitem }: { blogitem: EditBlogitemT }) {
  const initialValues = {
    oid: blogitem.oid,
    title: blogitem.title,
    text: blogitem.text,
    summary: blogitem.summary,
  };
  const form = useForm({
    // https://mantine.dev/form/uncontrolled/#uncontrolled-mode
    // Recommended mode.
    mode: "uncontrolled",
    initialValues,
    onValuesChange: (values) => {
      // ✅ This will be called on every form values change
      const { title, oid } = values;
      if (title) {
        if (!form.isTouched("oid") || !oid) {
          form.setFieldValue("oid", slugify(title));
          form.setTouched({ oid: false });
        }
      }
    },
  });
  const [submittedValues, setSubmittedValues] = useState<
    typeof form.values | null
  >(null);

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

  useEffect(() => {
    console.log("submittedValues", submittedValues);
  }, [submittedValues]);

  return (
    <form
      // onSubmit={(event) => event.preventDefault()}
      onSubmit={form.onSubmit(setSubmittedValues)}
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
