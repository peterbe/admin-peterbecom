import { Box, Button, Group, LoadingOverlay, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { API_BASE } from "../../config";
import type { EditBlogitemT } from "../../types";

export function ArchiveBlogitem({ blogitem }: { blogitem: EditBlogitemT }) {
  const [asked, setAsked] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["archive-blogitem", blogitem.oid],
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/plog/${blogitem.oid}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toggle_archived: true,
        }),
      });
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return response.json();
    },
    onSuccess: () => {
      setAsked(false);
      notifications.show({
        message: "Blogitem archived status toggled",
        color: "green",
      });

      queryClient.invalidateQueries({ queryKey: ["blogitem", blogitem.oid] });
      queryClient.invalidateQueries({ queryKey: ["blogitems"] });
    },
  });

  useEffect(() => {
    if (mutation.data) {
      setAsked(false);
    }
  }, [mutation.data]);

  return (
    <Box mb={10} pos="relative">
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
              Yes, {blogitem.archived ? "unarchive" : "archive"} it
            </Button>
            <Button onClick={() => setAsked(false)}>Cancel</Button>
          </Group>
        </Box>
      ) : (
        <Button size="xs" color="orange" onClick={() => setAsked(true)}>
          {blogitem.archived ? "Unarchive" : "Archive"}
        </Button>
      )}
    </Box>
  );
}
