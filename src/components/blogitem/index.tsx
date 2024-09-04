import { useDocumentTitle } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";

import { Alert, LoadingOverlay } from "@mantine/core";
import { API_BASE } from "../../config";
import type { BlogitemT, EditBlogitemT } from "../../types";
import { SignedIn } from "../signed-in";
import { Form } from "./edit-form";

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
  blogitem: EditBlogitemT;
};

function Edit({ oid }: { oid: string | null }) {
  const { data, error, isPending } = useQuery<ServerData>({
    queryKey: ["blogitem", oid],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/plog/${oid}`);
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return await response.json();
    },
  });

  if (isPending) {
    return <LoadingOverlay />;
  }

  return (
    <div>
      {isPending && <LoadingOverlay />}
      {error && (
        <Alert color="red">Failed to load blogitem: {error.message}</Alert>
      )}
      {data && <Form blogitem={data.blogitem} />}
    </div>
  );
}

function Add() {
  const blogitem: BlogitemT = {
    id: 0,
    oid: "",
    title: "",
  };
  return <Form blogitem={blogitem} />;
}
