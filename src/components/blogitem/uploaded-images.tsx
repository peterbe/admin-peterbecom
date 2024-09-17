import {
  Alert,
  Anchor,
  Box,
  Button,
  Card,
  Group,
  SegmentedControl,
  TextInput,
  Title,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";

import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ImageT } from "../../hooks/use-images";
import { useUserData } from "../../hooks/use-userdata";
import { JSONPost } from "../json-post";
import { AbsoluteImage } from "./absolute-image";

type ImageSize = "small" | "big" | "bigger";

export function UploadedImages({
  oid,
  images,
}: {
  oid: string;
  images: ImageT[];
}) {
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  useEffect(() => {
    if (window.location.hostname === "localhost") {
      setImageBaseUrl("http://localhost:8000");
    } else {
      setImageBaseUrl("https://www.peterbe.com");
    }
  }, []);
  const [size, setSize] = useLocalStorage<ImageSize>({
    key: "admin-uploaded-images-size",
    defaultValue: "small",
  });

  return (
    <Box mb={100} mt={50}>
      <Title order={3}>
        {images.length} image{images.length === 1 ? "" : "s"} uploaded
      </Title>
      <Group>
        {images.map((image) => (
          <UploadedImage
            key={image.id}
            oid={oid}
            image={image}
            size={size}
            imageBaseUrl={imageBaseUrl}
          />
        ))}
      </Group>

      <SegmentedControl
        mt={40}
        value={size}
        onChange={(value: string) => setSize(value as ImageSize)}
        data={[
          { label: "Smaller", value: "small" },
          { label: "Big", value: "big" },
          { label: "Bigger", value: "bigger" },
        ]}
      />
    </Box>
  );
}

function UploadedImage({
  oid,
  image,
  size,
  imageBaseUrl,
}: {
  oid: string;
  image: ImageT;
  size: ImageSize;
  imageBaseUrl: string;
}) {
  const [asked, setAsked] = useState(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: image[size].alt || "",
    },
  });

  const { userData } = useUserData();
  const csrfToken = userData?.user?.csrfmiddlewaretoken || "";
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["images", oid, "image", image.full_url],
    mutationFn: async ({ title }: { title: string }) => {
      const formData = new FormData();
      formData.append("_update", "true");
      formData.append("id", `${image.id}`);
      formData.append("title", title);

      const response = await JSONPost(
        `/api/v0/plog/${oid}/images`,
        formData,
        csrfToken,
      );

      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      form.setValues({ title: title.trim() });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images", oid] });
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["images", oid, "image", "delete"],
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("_delete", "true");
      formData.append("id", `${image.id}`);
      const response = await JSONPost(
        `/api/v0/plog/${oid}/images?${new URLSearchParams({
          id: `${image.id}`,
        })}`,
        formData,
        csrfToken,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images", oid] });
      notifications.show({ message: "Image deleted", color: "green" });
    },
  });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Anchor href={imageBaseUrl + image.full_url} target="_blank">
          <AbsoluteImage src={image[size].url} />
        </Anchor>
      </Card.Section>

      {mutation.error && (
        <Alert title="Error" color="red">
          {mutation.error.message}
        </Alert>
      )}

      <form
        onSubmit={form.onSubmit((data) => {
          if (data !== null) {
            mutation.mutate(data);
          }
        })}
      >
        <TextInput
          label="Title"
          key={form.key("title")}
          {...form.getInputProps("title")}
        />
        {asked ? (
          <>
            <Group justify="flex-end" mt="md">
              <Button
                type="button"
                color="red"
                disabled={deleteMutation.isPending}
                loading={deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate();
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
          </>
        ) : (
          <>
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
          </>
        )}
      </form>
    </Card>
  );
}
