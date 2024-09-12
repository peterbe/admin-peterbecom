import {
  Alert,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Text,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { SignedIn } from "../signed-in";
import { AbsoluteImage } from "./absolute-image";
import { BlogitemLinks } from "./links";

export default function OpenGraphImage() {
  const params = useParams();
  const oid = params.oid as string;

  useDocumentTitle(`Open Graph image for ${oid}`);

  return (
    <SignedIn>
      <BlogitemLinks oid={oid} />
      <Selection oid={oid} />
    </SignedIn>
  );
}

type OpenGraphImage = {
  label: string;
  src: string;
  size: [number, number];
  current: null | boolean;
  used_in_text: boolean;
};

type OpenGraphImages = {
  images: OpenGraphImage[];
};

function Selection({ oid }: { oid: string }) {
  const { data, error, isPending } = useQuery<OpenGraphImages>({
    queryKey: ["open-graph-image", oid],
    queryFn: async () => {
      const response = await fetch(`/api/v0/plog/${oid}/open-graph-image`);
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return response.json();
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["open-graph-image", oid],
    mutationFn: async (src: string) => {
      const response = await fetch(`/api/v0/plog/${oid}/open-graph-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ src }),
      });
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["open-graph-image", oid],
      });
    },
  });

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isPending} />
      {error && <Alert title="Error">{error.message}</Alert>}
      {data && data.images.length === 0 && (
        <Alert title="No images found">
          <Link href={`/plog/${oid}/images`}>Upload some images</Link>
        </Alert>
      )}
      {mutation.error && <Alert title="Error">{mutation.error.message}</Alert>}
      <Group>
        {(data?.images || []).map((image) => {
          return (
            <ImageChoice
              image={image}
              key={image.src}
              onSelect={(src: string) => {
                mutation.mutate(src);
              }}
            />
          );
        })}
      </Group>
    </Box>
  );
}

function ImageChoice({
  image,
  onSelect,
}: {
  image: OpenGraphImage;
  onSelect: (src: string) => void;
}) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <AbsoluteImage src={image.src} alt={image.label || ""} w={400} />
      </Card.Section>

      <Text fw={500}>
        {image.size[0]}x{image.size[1]}
      </Text>

      <Button
        disabled={!!image.current}
        onClick={() => {
          onSelect(image.src);
        }}
      >
        This one
      </Button>
    </Card>
  );
}
