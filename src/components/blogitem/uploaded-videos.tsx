import {
  Alert,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  SegmentedControl,
  TextInput,
  Title,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { useLocalStorage } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import type { VideoT } from "../../hooks/use-videos"
import { useUserData } from "../../whoami/use-userdata"
import { JSONPost } from "../json-post"
import { useAbsoluteBaseUrl } from "./use-absolute-base-url"

type ImageSize = "full" | "big" | "bigger"

export function UploadedVideos({
  oid,
  videos,
  loading,
}: {
  oid: string
  videos: VideoT[]
  loading: boolean
}) {
  const baseUrl = useAbsoluteBaseUrl()
  const [size, setSize] = useLocalStorage<ImageSize>({
    key: "admin-uploaded-videos-size",
    defaultValue: "big",
  })

  return (
    <Box mb={100} mt={50} pos="relative" style={{ minHeight: 200 }}>
      <LoadingOverlay visible={loading} />
      <Title order={3}>
        {videos.length} video{videos.length === 1 ? "" : "s"} uploaded
      </Title>
      <Group>
        {videos.map((video) => (
          <UploadedVideo
            key={video.id}
            oid={oid}
            video={video}
            size={size}
            baseUrl={baseUrl}
          />
        ))}
      </Group>

      {videos.length > 0 && (
        <SegmentedControl
          mt={40}
          value={size}
          onChange={(value: string) => setSize(value as ImageSize)}
          data={[
            { label: "Full", value: "full" },
            { label: "Big", value: "big" },
            { label: "Bigger", value: "bigger" },
          ]}
        />
      )}
    </Box>
  )
}

function UploadedVideo({
  oid,
  video,
  size,
  baseUrl,
}: {
  oid: string
  video: VideoT
  size: ImageSize
  baseUrl: string
}) {
  const [asked, setAsked] = useState(false)
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: video.thumbnails.full.alt || "",
    },
  })

  const { userData } = useUserData()
  const csrfToken = userData?.user?.csrfmiddlewaretoken || ""
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: ["videos", oid, "video", video.id],
    mutationFn: async ({ title }: { title: string }) => {
      const formData = new FormData()
      formData.append("_update", "true")
      formData.append("id", `${video.id}`)
      formData.append("title", title)

      const response = await JSONPost(
        `/api/v0/plog/${oid}/videos`,
        formData,
        csrfToken,
      )

      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      form.setValues({ title: title.trim() })
      return response.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["videos", oid] })
    },
  })

  const deleteMutation = useMutation({
    mutationKey: ["videos", oid, "video", video.id, "delete"],
    mutationFn: async () => {
      const formData = new FormData()
      formData.append("_delete", "true")
      formData.append("id", `${video.id}`)
      const response = await JSONPost(
        `/api/v0/plog/${oid}/videos?${new URLSearchParams({
          id: `${video.id}`,
        })}`,
        formData,
        csrfToken,
        { method: "DELETE" },
      )

      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["videos", oid] })
      notifications.show({ message: "Video deleted", color: "green" })
    },
  })

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <video
          controls
          poster={`${baseUrl}${video.thumbnails[size].url}`}
          style={{ maxWidth: 500 }}
        >
          {Object.entries(video.formats).map(([format, { url, type }]) => (
            <source key={format} src={`${baseUrl}${url}`} type={type} />
          ))}
        </video>
      </Card.Section>

      {mutation.error && (
        <Alert title="Error" color="red">
          {mutation.error.message}
        </Alert>
      )}

      <form
        onSubmit={form.onSubmit((data) => {
          if (data !== null) {
            mutation.mutate(data)
          }
        })}
      >
        <TextInput
          label="Title"
          key={form.key("title")}
          {...form.getInputProps("title")}
        />
        {asked ? (
          <Group justify="flex-end" mt="md">
            <Button
              type="button"
              color="red"
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
              onClick={() => {
                deleteMutation.mutate()
              }}
            >
              Delete
            </Button>
            <Button
              variant="light"
              type="button"
              color="orange"
              onClick={() => setAsked(false)}
            >
              Cancel
            </Button>
          </Group>
        ) : (
          <Group justify="flex-end" mt="md">
            <Button type="submit">Save</Button>
            <Button
              variant="light"
              type="button"
              color="orange"
              onClick={() => setAsked(true)}
            >
              Delete
            </Button>
          </Group>
        )}
      </form>
    </Card>
  )
}
