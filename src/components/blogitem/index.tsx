import { useDocumentTitle } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";

import { Alert, Box, LoadingOverlay } from "@mantine/core";
import { API_BASE } from "../../config";
import type { EditBlogitemT } from "../../types";
import { DisplayDate } from "../blogitems/list-table";
import { SignedIn } from "../signed-in";
import { DangerZone } from "./danger-zone";
import { Form } from "./edit-form";
import { BlogitemLinks } from "./links";

export default function Blogitem() {
  const params = useParams();
  let oid: string | null = null;
  if ("oid" in params && typeof params.oid === "string") {
    oid = params.oid;
  }

  useDocumentTitle(oid ? `Edit ${oid}` : "Add new blogitem");

  return <SignedIn>{oid ? <Edit oid={oid} /> : <Add />}</SignedIn>;
}

type ServerData = {
  blogitem?: EditBlogitemT;
  notFound?: boolean;
};

function Edit({ oid }: { oid: string | null }) {
  const { data, error, isPending } = useQuery<ServerData>({
    queryKey: ["blogitem", oid],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/plog/${oid}`);
      if (response.status === 404) {
        return { notFound: true };
      }
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return await response.json();
    },
  });

  return (
    <Box pos="relative" style={{ minHeight: 400 }}>
      <LoadingOverlay visible={isPending} />
      {error && (
        <Alert color="red">Failed to load blogitem: {error.message}</Alert>
      )}
      {data?.blogitem?.archived && (
        <Alert color="orange" title="Archived!">
          This blogitem was archived on <b>{data.blogitem.archived}</b> (
          <DisplayDate date={data.blogitem.archived} />)
        </Alert>
      )}
      {data?.notFound && (
        <Alert color="red" title="Blogitem not found">
          No blogitem with oid <b>{oid}</b> found
        </Alert>
      )}

      {data?.blogitem?.id && <BlogitemLinks oid={data.blogitem.oid} />}

      {data?.blogitem && <Form blogitem={data.blogitem} />}
      {data?.blogitem?.id && <DangerZone blogitem={data.blogitem} />}
    </Box>
  );
}

function Add() {
  const blogitem: EditBlogitemT = {
    id: 0,
    oid: "",
    title: "",
    summary: "",
    text: "",
    pub_date: new Date().toISOString(),
    categories: [],
    keywords: [],
    url: "",
    display_format: "markdown",
    codesyntax: "",
    hide_comments: false,
    disallow_comments: true,
    open_graph_image: "",
    archived: null,
  };

  return <Form blogitem={blogitem} />;
}
