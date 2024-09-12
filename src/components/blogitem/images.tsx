import {
  Alert,
  Anchor,
  Box,
  Group,
  LoadingOverlay,
  Paper,
  SegmentedControl,
  Text,
  rem,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { SignedIn } from "../signed-in";
import { BlogitemLinks } from "./links";
import "@mantine/dropzone/styles.css";
import {
  Dropzone,
  type FileWithPath,
  IMAGE_MIME_TYPE,
} from "@mantine/dropzone";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useUserData } from "../../hooks/use-userdata";
import { AbsoluteImage } from "./absolute-image";

type ImageT = {
  full_url: string;
  full_size: number[];
  small: {
    url: string;
    alt: null | string;
    width: number;
    height: number;
  };
  big: {
    url: string;
    alt: null | string;
    width: number;
    height: number;
  };
  bigger: {
    url: string;
    alt: null | string;
    width: number;
    height: number;
  };
};
type ServerImages = {
  images: ImageT[];
};
export default function OpenGraphImage() {
  const params = useParams();
  const oid = params.oid as string;
  const { userData } = useUserData();
  const csrfToken = userData?.user?.csrfmiddlewaretoken || "";

  const { data, error, isPending } = useQuery<ServerImages>({
    queryKey: ["images", oid],
    queryFn: async () => {
      const response = await fetch(`/api/v0/plog/${oid}/images`);
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return response.json();
    },
  });

  useDocumentTitle(`Images ${oid}`);

  return (
    <SignedIn>
      <Box pos="relative" style={{ minHeight: 200 }}>
        <LoadingOverlay visible={isPending} />

        <BlogitemLinks oid={oid} />
        {error && <Alert title="Error">{error.message}</Alert>}

        {csrfToken && <Upload oid={oid} csrfToken={csrfToken} />}

        {data && data.images.length === 0 && (
          <Alert style={{ marginTop: 100 }} title="No images found" />
        )}
        {data?.images && <Paper>{data.images.length} images uploaded.</Paper>}
        {data && <Images images={data.images} />}
      </Box>
    </SignedIn>
  );
}

function Upload({ oid, csrfToken }: { oid: string; csrfToken: string }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ["images", oid],
    mutationFn: async (files: FileWithPath[]) => {
      console.log({ files });
      const formData = new FormData();
      for (const file of files) {
        formData.append("file", file);
      }

      const response = await JSONPost(
        `/api/v0/plog/${oid}/images`,
        formData,
        csrfToken,
      );

      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images", oid] });
    },
  });

  function uploadFiles(files: FileWithPath[]) {
    mutation.mutate(files);
  }

  return (
    <Box pos="relative">
      {/* <LoadingOverlay visible={mutation.isPending} /> */}
      {mutation.data && <Alert title="Uploaded" withCloseButton />}

      {mutation.error && <Alert title="Error">{mutation.error.message}</Alert>}
      {/* {data && data.images.length === 0 && (
        <Alert title="No images found">
          <Link href={`/plog/${oid}/images`}>Upload some images</Link>
        </Alert>
      )} */}
      <Dropzone
        onDrop={(files) => uploadFiles(files)}
        onReject={(files) => console.log("rejected files", files)}
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
        loading={mutation.isPending}
        // {...props}
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
  );
}

async function JSONPost(url: string, data: FormData, csrfToken: string) {
  const body = data instanceof FormData ? data : JSON.stringify(data);

  const method = "POST";
  const headers = {
    "X-CSRFToken": csrfToken,
  };
  return await fetch(url, {
    method,
    body,
    headers,
  });
}

type ImageSize = "small" | "big" | "bigger";

function Images({ images }: { images: ImageT[] }) {
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  useEffect(() => {
    if (window.location.hostname === "localhost") {
      setImageBaseUrl("http://localhost:8000");
    } else {
      setImageBaseUrl("https://www.peterbe.com");
    }
  }, []);
  const [size, setSize] = useState<ImageSize>("small");
  return (
    <Box style={{ marginBottom: 100 }}>
      <Group>
        {images.map((image) => {
          return (
            <Anchor
              key={image.full_url}
              href={imageBaseUrl + image.full_url}
              target="_blank"
            >
              <AbsoluteImage src={image[size].url} />
            </Anchor>
          );
        })}
      </Group>
      <SegmentedControl
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
