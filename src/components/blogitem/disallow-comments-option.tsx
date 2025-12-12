import { Box, Button, Group, LoadingOverlay, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import type { EditBlogitemT } from "@/types"
import { API_BASE } from "../../config"
import { blogitemQueryKey, blogitemsQueryKey } from "../api-utils"

export function BlogitemDisallowComments({
  blogitem,
}: {
  blogitem: EditBlogitemT
}) {
  const [asked, setAsked] = useState(false)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: ["disallow-comments-blogitem", blogitem.oid],
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/plog/${blogitem.oid}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toggle_disallow_comments: true,
        }),
      })
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
    onSuccess: async () => {
      setAsked(false)
      notifications.show({
        message: blogitem.disallow_comments
          ? "Comments allowed"
          : "Comments disallowed",
        color: "green",
      })

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: blogitemQueryKey(blogitem.oid),
        }),
        queryClient.invalidateQueries({ queryKey: blogitemsQueryKey() }),
      ])
    },
  })

  return (
    <Box mb={10} pos="relative">
      <LoadingOverlay visible={mutation.isPending} />
      {asked ? (
        <Box>
          <Text>Are you sure?</Text>
          <Group>
            <Button
              color="red"
              onClick={() => {
                mutation.mutate()
              }}
            >
              Yes, {blogitem.disallow_comments ? "allow" : "disallow"} comments
            </Button>
            <Button onClick={() => setAsked(false)}>Cancel</Button>
          </Group>
        </Box>
      ) : (
        <Button size="xs" color="orange" onClick={() => setAsked(true)}>
          {blogitem.disallow_comments ? "Allow comments" : "Disallow comments"}
        </Button>
      )}
    </Box>
  )
}
