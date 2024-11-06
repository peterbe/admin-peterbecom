import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Group,
  LoadingOverlay,
  Text,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  type OpenGraphImageT,
  useOpenGraphImages,
} from "../../hooks/use-open-graph-images";
import { SignedIn } from "../signed-in";
import { AbsoluteImage } from "./absolute-image";
import { BlogitemLinks } from "./links";

export default function OpenGraphImage() {
  const params = useParams();
  const oid = params.oid as string;

  useDocumentTitle(`Open Graph image for ${oid}`);

  return (
    <SignedIn>
      <Container>
        <BlogitemLinks oid={oid} />
        <Selection oid={oid} />
      </Container>
    </SignedIn>
  );
}

function Selection({ oid }: { oid: string }) {
  const { data, error, isPending } = useOpenGraphImages(oid);

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isPending} />
      {error && <Alert title="Error">{error.message}</Alert>}
      {data && data.images.length === 0 && (
        <Alert title="No images found">
          <Link to={`/plog/${oid}/images`}>Upload some images</Link>
        </Alert>
      )}
      <Group>
        {(data?.images || []).map((image) => {
          return <ImageChoice image={image} key={image.src} oid={oid} />;
        })}
      </Group>
    </Box>
  );
}

function ImageChoice({ image, oid }: { image: OpenGraphImageT; oid: string }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["open-graph-image", oid],
    mutationFn: async () => {
      const response = await fetch(`/api/v0/plog/${oid}/open-graph-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ src: image.src }),
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
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <AbsoluteImage src={image.src} alt={image.label || ""} w={400} />
      </Card.Section>

      <Text fw={500}>
        {image.size[0]}x{image.size[1]}
      </Text>

      {mutation.error && <Alert title="Error">{mutation.error.message}</Alert>}

      <Button
        disabled={!!image.current || mutation.isPending}
        onClick={() => {
          mutation.mutate();
        }}
      >
        This one
      </Button>
    </Card>
  );
}
