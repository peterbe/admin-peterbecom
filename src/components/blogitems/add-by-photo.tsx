import { Button, Container, Group, rem, TextInput } from "@mantine/core"
import "@mantine/dropzone/styles.css"

import { Alert, Box, Image, Text } from "@mantine/core"
import { Dropzone, type FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone"
import { useForm } from "@mantine/form"
import { useDocumentTitle } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useUserData } from "../../whoami/use-userdata"
import { slugify } from "../blogitem/slugify"
import { JSONPost } from "../json-post"
import { SignedIn } from "../signed-in"

export default function AddByPhoto() {
  const { userData } = useUserData()
  const csrfToken = userData?.user?.csrfmiddlewaretoken || ""

  useDocumentTitle("Add by photo")

  return (
    <SignedIn>
      <Container>
        <Add csrfToken={csrfToken} />
      </Container>
    </SignedIn>
  )
}

function Add({ csrfToken }: { csrfToken: string }) {
  const [uploadedFile, setUploadedFile] = useState<FileWithPath | null>(null)
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationKey: ["add-by-photo"],
    mutationFn: async ({
      file,
      title,
      oid,
      pub_date,
    }: {
      file: FileWithPath
      title: string
      oid: string
      pub_date: string
    }) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("oid", oid)
      formData.append("pub_date", pub_date)
      formData.append("is_photo", "true")

      const response = await JSONPost(
        "/api/v0/plog/add-by-photo/",
        formData,
        csrfToken,
      )

      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
    onSuccess: async (data) => {
      setUploadedFile(null)
      notifications.show({
        message: "Photo blog item created",
        color: "green",
      })

      void navigate(`/plog/${data.oid}/open-graph-image`)
    },
  })

  const titleRef = useRef<HTMLInputElement>(null)

  function uploadFiles(files: FileWithPath[]) {
    if (files.length > 0) {
      setUploadedFile(files[0] as FileWithPath)
      if (titleRef.current) {
        titleRef.current.focus()
      }
    }
  }

  return (
    <Box pos="relative" style={{ minHeight: 400 }}>
      {mutation.data && <Alert title="Uploaded" />}
      {mutation.error && <Alert title="Error">{mutation.error.message}</Alert>}

      {uploadedFile && (
        <MinimalForm
          titleRef={titleRef}
          onSubmit={({
            title,
            oid,
            pub_date,
          }: {
            title: string
            oid: string
            pub_date: string
          }) => {
            mutation.mutate({ file: uploadedFile, title, oid, pub_date })
          }}
          initialTitle={""}
        />
      )}

      {uploadedFile && <PreviewUploadedFile file={uploadedFile} />}

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

function MinimalForm({
  onSubmit,
  initialTitle = "",
  titleRef,
}: {
  onSubmit: ({
    title,
    oid,
    pub_date,
  }: {
    title: string
    oid: string
    pub_date: string
  }) => void
  initialTitle?: string
  titleRef: React.RefObject<HTMLInputElement | null>
}) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: initialTitle || "",
      oid: initialTitle ? slugify(initialTitle) : "", // Placeholder for actual OID generation logic
      pub_date: new Date().toISOString(),
    },
    validate: {
      title: (value: string) => (value.trim() ? null : "Required"),
      // oid: (value: string) => (value.trim() ? null : "Required"),
      oid: (value: string, values) => {
        if (!values.title) {
          return null
        }
        return value.trim() ? null : "Required"
      },
    },

    onValuesChange: (values) => {
      const { title, oid } = values

      // blogitem.id will be 0 when it's for adding a new one
      if (title) {
        if (!form.isTouched("oid") || !oid) {
          form.setFieldValue("oid", slugify(title))
          form.setTouched({ oid: false })
        }
      }
    },
  })

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        if (values.title?.trim()) {
          onSubmit(values)
        }
      })}
    >
      <TextInput
        withAsterisk
        label="Title"
        size="md"
        key={form.key("title")}
        ref={titleRef}
        {...form.getInputProps("title")}
      />
      <TextInput label="OID" size="xs" {...form.getInputProps("oid")} />
      <TextInput
        label="Pub date"
        size="xs"
        {...form.getInputProps("pub_date")}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  )
}
