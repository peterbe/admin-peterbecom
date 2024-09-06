import { Box, Button, Group, LoadingOverlay, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Redirect } from "wouter";
import { API_BASE } from "../../config";

export function DeleteBlogitem({ oid }: { oid: string }) {
  const [asked, setAsked] = useState(false);

  const mutation = useMutation({
    mutationKey: ["delete-blogitem", oid],
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/plog/${oid}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      notifications.show({ message: "Blogitem deleted", color: "green" });
      return response.json();
    },
  });

  return (
    <Box mb={10} pos="relative">
      {mutation.data && <Redirect to="/plog" />}
      <LoadingOverlay visible={mutation.isPending} />
      {asked ? (
        <Box>
          <Text>Are you absolutely sure?</Text>
          <Group>
            <Button
              color="red"
              onClick={() => {
                mutation.mutate();
              }}
            >
              Yes, delete it
            </Button>
            <Button onClick={() => setAsked(false)}>Cancel</Button>
          </Group>
        </Box>
      ) : (
        <Button size="xs" color="orange" onClick={() => setAsked(true)}>
          Delete
        </Button>
      )}
    </Box>
  );
}
