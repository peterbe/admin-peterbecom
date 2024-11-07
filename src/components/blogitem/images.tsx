import {
  Alert,
  Box,
  Button,
  Container,
  Group,
  Image,
  LoadingOverlay,
  Text,
  TextInput,
  Title,
  rem,
} from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { SignedIn } from "../signed-in"
import { BlogitemLinks } from "./links"
import "@mantine/dropzone/styles.css"
import { Dropzone, type FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone"
import { useForm } from "@mantine/form"
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useImages } from "../../hooks/use-images"
import { useUserData } from "../../whoami/use-userdata"
import { JSONPost } from "../json-post"
import { UploadedImages } from "./uploaded-images"

export function Component() {
  const params = useParams()
  const oid = params.oid as string
  const { userData } = useUserData()
  const csrfToken = userData?.user?.csrfmiddlewaretoken || ""

  const { data, error, isPending } = useImages(oid)

  useDocumentTitle(`Images ${oid}`)

  return (
    <SignedIn>
      <Container>
        <Box pos="relative" style={{ minHeight: 200 }}>
          <LoadingOverlay visible={isPending} />

          <BlogitemLinks oid={oid} />
          {error && <Alert title="Error">{error.message}</Alert>}

          {csrfToken && <Upload oid={oid} csrfToken={csrfToken} />}

          {data && <UploadedImages oid={oid} images={data.images} />}
        </Box>
      </Container>
    </SignedIn>
  )
}

function Upload({ oid, csrfToken }: { oid: string; csrfToken: string }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ["images", oid],
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
        `/api/v0/plog/${oid}/images`,
        formData,
        csrfToken,
      )

      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images", oid] })
      setUploadedFile(null)
    },
  })

  const [uploadedFile, setUploadedFile] = useState<FileWithPath | null>(null)

  function uploadFiles(files: FileWithPath[]) {
    if (files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  return (
    <Box pos="relative">
      {mutation.data && <Alert title="Uploaded" />}

      {mutation.error && <Alert title="Error">{mutation.error.message}</Alert>}

      <Title order={3}>Upload a new image</Title>

      {uploadedFile && <PreviewUploadedFile file={uploadedFile} />}

      {uploadedFile && (
        <TitleForm
          onSubmitTitle={(title: string) => {
            mutation.mutate({ file: uploadedFile, title })
          }}
        />
      )}

      <Dropzone
        onDrop={(files) => uploadFiles(files)}
        onReject={(files) => console.log("rejected files", files)}
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
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

          <div>
            <Text size="xl" inline>
              Drag images here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Attach as many files as you like, each file should not exceed 5mb
            </Text>
          </div>
        </Group>
      </Dropzone>
    </Box>
  )
}

function PreviewUploadedFile({ file }: { file: FileWithPath }) {
  const [dataURI, setDataURI] = useState<string | ArrayBuffer | null>(null)

  useEffect(() => {
    const reader = new FileReader()
    function listener() {
      setDataURI(reader.result)
    }
    reader.addEventListener("load", listener, false)
    reader.readAsDataURL(file)

    return () => {
      reader.removeEventListener("load", listener)
    }
  }, [file])

  if (!dataURI) {
    return null
  }

  return (
    <Box>
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
