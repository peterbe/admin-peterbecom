import {
  Avatar,
  Box,
  Button,
  Group,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { DisplayDate } from "../blogitems/list-table";
import classes from "./comments-tree.module.css";
import { gravatarSrc } from "./gravatar-src";
import type { Comment } from "./types";

import { API_BASE } from "../../config";

export function CommentsTree({
  comments,
  disabled,
  refetchComments,
}: {
  comments: Comment[];
  disabled: boolean;
  refetchComments: () => void;
}) {
  return (
    <Box>
      {comments.map((comment) => (
        <div key={comment.id}>
          <InnerComment
            disabled={disabled}
            comment={comment}
            refetchComments={refetchComments}
          />
        </div>
      ))}
    </Box>
  );
}

type PostedError = {
  errors: Record<string, string | string[]>;
};

function InnerComment({
  comment,
  disabled,
  refetchComments,
}: {
  comment: Comment;
  disabled: boolean;
  refetchComments: () => void;
}) {
  const [editMode, setEditMode] = useState(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      oid: comment.oid,
      comment: comment.comment,
      name: comment.name || "",
      email: comment.email || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof form.values) => {
      const url = `${API_BASE}/plog/comments/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.status === 400) {
        const json = (await response.json()) as PostedError;
        notifications.show({
          title: "Validation errors",
          message: "Look for red",
          color: "red",
        });
        for (const [field, errors] of Object.entries(json.errors)) {
          form.setFieldError(
            field,
            Array.isArray(errors) ? errors.join(", ") : errors,
          );
        }
      } else if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return response.json();
    },
    onSuccess: () => {
      notifications.show({
        title: "Saved",
        message: "Comment details saved and updated",
        color: "green",
      });
      setEditMode(false);
      refetchComments();
    },
  });

  return (
    <Box mb={30}>
      <form
        onSubmit={form.onSubmit((data) => {
          if (data !== null) {
            mutation.mutate(data);
          }
        })}
      >
        <Group>
          <Avatar
            src={gravatarSrc(comment)}
            alt={comment.name || comment.email || "No name or email"}
            radius="xl"
          />
          <div>
            {editMode ? (
              <Group>
                <TextInput
                  label="Name"
                  placeholder="name"
                  key={form.key("name")}
                  {...form.getInputProps("name")}
                  disabled={disabled}
                />
                <TextInput
                  label="Email"
                  placeholder="email"
                  key={form.key("email")}
                  {...form.getInputProps("email")}
                  disabled={disabled}
                />
              </Group>
            ) : (
              <Text size="sm" fw={700}>
                {comment.name ? <b>{comment.name}</b> : <i>No name</i>}{" "}
                {comment.email ? <b>{comment.email}</b> : <i>No email</i>}
              </Text>
            )}
            {!editMode && (
              <Text size="xs">
                <DisplayDate date={comment.add_date} />
                {!equalDates(comment.add_date, comment.modify_date) && (
                  <>
                    , modified <DisplayDate date={comment.modify_date} />
                  </>
                )}
              </Text>
            )}
          </div>
        </Group>
        {editMode ? (
          <Textarea
            ml={54}
            pt={12}
            mb={10}
            classNames={{ input: classes.input }}
            key={form.key("comment")}
            {...form.getInputProps("comment")}
            autosize
            minRows={3}
            maxRows={10}
            disabled={disabled}
          />
        ) : (
          <Text
            pl={54}
            pt="sm"
            size="sm"
            dangerouslySetInnerHTML={{ __html: comment.rendered }}
          />
        )}

        <Group>
          <Button
            ml={54}
            variant="light"
            onClick={() => {
              if (editMode) {
                if (form.isDirty()) {
                  if (window.confirm("Discard changes?")) {
                    form.reset();
                  } else {
                    return;
                  }
                }
              }
              setEditMode((p) => !p);
            }}
            disabled={disabled}
          >
            {editMode ? "Close" : "Edit"}
          </Button>
          {editMode && (
            <Button type="submit" disabled={disabled}>
              Save changes
            </Button>
          )}
        </Group>
      </form>
    </Box>
  );
}

// E.g. '2016-05-19T22:07:40.630Z' ==  '2016-05-19T22:07:40.190Z'
function equalDates(a: string, b: string) {
  return a.split(".")[0] === b.split(".")[0];
}
