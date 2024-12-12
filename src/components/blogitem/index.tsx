import { useDocumentTitle } from "@mantine/hooks"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router"

import { Alert, Box, LoadingOverlay, Text } from "@mantine/core"
import type { EditBlogitemT } from "../../types"
import { DisplayDate } from "../blogitems/list-table"
import { SignedIn } from "../signed-in"
import { DangerZone } from "./danger-zone"
import { Form } from "./edit-form"
import { BlogitemLinks } from "./links"

import { blogitemQueryKey, fetchBlogitem } from "../api-utils"
import { Pageviews } from "./pageviews-loader"

export default function Blogitem() {
  const params = useParams()

  let oid: string | null = null
  if ("oid" in params && typeof params.oid === "string") {
    oid = params.oid
  }

  useDocumentTitle(oid ? `Edit ${oid}` : "Add new blogitem")

  return <SignedIn>{oid ? <Edit oid={oid} /> : <Add />}</SignedIn>
}

type ServerData = {
  blogitem?: EditBlogitemT
  notFound?: boolean
}

function Edit({ oid }: { oid: string | null }) {
  const { data, error, isPending, isFetching } = useQuery<ServerData>({
    queryKey: blogitemQueryKey(oid),
    queryFn: async () => {
      if (!oid) return null
      return fetchBlogitem(oid)
    },
    enabled: !!oid,
  })

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

      {data?.blogitem?.id && (
        <Text size="xs" ta="right">
          {isFetching ? (
            "Fetching..."
          ) : (
            <>
              Modified <DisplayDate date={data.blogitem.modify_date} />
            </>
          )}
        </Text>
      )}
      {data?.blogitem && <Form blogitem={data.blogitem} />}
      {data?.blogitem?.id && <Pageviews blogitem={data.blogitem} />}
      {data?.blogitem?.id && <DangerZone blogitem={data.blogitem} />}
    </Box>
  )
}

function Add() {
  const blogitem: EditBlogitemT = {
    id: 0,
    oid: "",
    title: "",
    summary: "",
    text: "",
    pub_date: new Date().toISOString(),
    modify_date: "",
    _absolute_url: "",
    categories: [],
    keywords: [],
    url: "",
    display_format: "markdown",
    codesyntax: "",
    hide_comments: false,
    disallow_comments: true,
    open_graph_image: "",
    archived: null,
  }

  return <Form blogitem={blogitem} />
}
