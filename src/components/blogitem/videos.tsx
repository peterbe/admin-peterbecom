import {
  Alert,
  Box,
  Button,
  Code,
  Container,
  Group,
  Image,
  LoadingOverlay,
  rem,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { SignedIn } from "../signed-in"
import { BlogitemLinks } from "./links"
import "@mantine/dropzone/styles.css"
import {
  Dropzone,
  type FileRejection,
  type FileWithPath,
} from "@mantine/dropzone"
import { useForm } from "@mantine/form"
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { Fragment, useEffect, useState } from "react"
import { useVideos } from "../../hooks/use-videos"
import { useUserData } from "../../whoami/use-userdata"
import { videosQueryKey } from "../api-utils"
import { JSONPost } from "../json-post"
import { createVideoThumbnail } from "./create-video-thumbnail"
import { UploadedVideos } from "./uploaded-videos"

export function Component() {
  const params = useParams()
  const oid = params.oid as string
  const { userData } = useUserData()
  const csrfToken = userData?.user?.csrfmiddlewaretoken || ""

  const { data, error, isPending, isRefetching } = useVideos(oid)

  useDocumentTitle(`Videos ${oid}`)

  return (
    <SignedIn>
      <Container>
        <Box pos="relative" style={{ minHeight: 200 }}>
          <LoadingOverlay visible={isPending} />

          <BlogitemLinks oid={oid} />
          {error && <Alert title="Error">{error.message}</Alert>}

          {csrfToken && <Upload oid={oid} csrfToken={csrfToken} />}

          {data && (
            <UploadedVideos
              oid={oid}
              videos={data.videos}
              loading={isPending || isRefetching}
            />
          )}
        </Box>
      </Container>
    </SignedIn>
  )
}

function Upload({ oid, csrfToken }: { oid: string; csrfToken: string }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ["videos", oid],
    mutationFn: async ({
      file,
      title,
    }: {
      file: FileWithPath
      title: string
    }) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)

      const response = await JSONPost(
        `/api/v0/plog/${oid}/videos`,
        formData,
        csrfToken,
      )

      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videosQueryKey(oid) })

      setUploadedFile(null)
    },
  })

  const [uploadedFile, setUploadedFile] = useState<FileWithPath | null>(null)

  function uploadFiles(files: FileWithPath[]) {
    if (files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  const maxMb = 50

  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([])
  return (
    <Box pos="relative">
      {mutation.data && <Alert title="Uploaded" />}

      {mutation.error && <Alert title="Error">{mutation.error.message}</Alert>}

      <Title order={3}>Upload a new video</Title>

      {uploadedFile && <PreviewUploadedFile file={uploadedFile} />}

      {uploadedFile && (
        <TitleForm
          onSubmitTitle={(title: string) => {
            mutation.mutate({ file: uploadedFile, title })
          }}
        />
      )}

      <Dropzone
        onDrop={(files) => {
          uploadFiles(files)
          setRejectedFiles([])
        }}
        onReject={(files) => {
          setRejectedFiles(files)
        }}
        maxSize={maxMb * 1024 ** 2}
        accept={["video/quicktime"]}
        loading={mutation.isPending}
        multiple={false}
      >
        <Group
          justify="center"
          gap="xl"
          mih={220}
          style={{ pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconUpload
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-blue-6)",
              }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-red-6)",
              }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-dimmed)",
              }}
              stroke={1.5}
            />
          </Dropzone.Idle>

          <Dropzone.Accept>
            <Text size="xl" inline>
              Drag videos here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Looking good!
            </Text>
          </Dropzone.Accept>
          <Dropzone.Reject>
            <Text size="xl" inline>
              {rejectedFiles.length} rejected file
              {rejectedFiles.length === 1 ? "" : "s"}
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              {rejectedFiles.map((rejectedFile) => {
                return (
                  <Fragment key={rejectedFile.file.name}>
                    <Code>{rejectedFile.file.name}</Code>:{" "}
                    {rejectedFile.errors.map((er) => (
                      <Text span key={er.code}>
                        {er.message}
                      </Text>
                    ))}
                  </Fragment>
                )
              })}
            </Text>
          </Dropzone.Reject>
          <Dropzone.Idle>
            <Text size="xl" inline>
              Drag videos here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Attach as many files as you like, each file should not exceed{" "}
              {maxMb}mb
            </Text>
          </Dropzone.Idle>
        </Group>
      </Dropzone>
    </Box>
  )
}

function PreviewUploadedFile({ file }: { file: FileWithPath }) {
  const [dataURI, setDataURI] = useState<string | ArrayBuffer | null>(null)
  const [previewError, setPreviewError] = useState<Error | null>(null)

  useEffect(() => {
    createVideoThumbnail(file)
      .then((dataURI) => {
        setDataURI(dataURI)
      })
      .catch((error) => {
        if (error instanceof Error) setPreviewError(error)
        console.error("ERROR!", error)
      })
  }, [file])

  if (!dataURI) {
    return null
  }

  return (
    <Box>
      {previewError && <Alert color="red">{previewError.toString()}</Alert>}
      <Text>Preview of uploaded image</Text>
      <Image
        radius="md"
        w={400}
        src={dataURI as string}
        alt="preview of image"
      />
    </Box>
  )
}

function TitleForm({
  onSubmitTitle,
}: {
  onSubmitTitle: (title: string) => void
}) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: "",
    },
    validate: {
      title: (value: string) => (value.trim() ? null : "Required"),
    },
  })
  return (
    <form
      onSubmit={form.onSubmit((values) => {
        if (values.title?.trim()) {
          onSubmitTitle(values.title.trim())
        }
      })}
    >
      <TextInput
        withAsterisk
        label="Title"
        key={form.key("title")}
        {...form.getInputProps("title")}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  )
}
