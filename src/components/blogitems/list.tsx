import { Alert, LoadingOverlay } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import { useLocation, useSearch } from "wouter";
import { API_BASE } from "../../config";
import type { BlogitemsServerData } from "../../types";
import { ListTable } from "./list-table";
// import * as v from "valibot";
// import { validateSchemaToData } from "../../validate-schema";

// const BlogitemSchema = v.object({
//   id: v.number(),
//   oid: v.string(),
//   pub_date: v.string(),
//   _is_published: v.boolean(),
//   modify_date: v.string(),
//   categories: v.array(v.object({ id: v.number(), name: v.string() })),
//   keywords: v.array(v.string()),
//   summary: v.string(),
//   archived: v.nullable(v.string()),
// });

// const ServerDataSchema = v.object({
//   blogitems: v.array(BlogitemSchema),
//   count: v.number(),
// });

export function List() {
  const [location, navigate] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const search = searchParams.get("search") || "";
  const orderBy = searchParams.get("orderBy") || "modify_date";

  const sp = new URLSearchParams({ search, order: orderBy });
  const apiUrl = `${API_BASE}/plog/?${sp}`;

  const { data, error, isPending } = useQuery<BlogitemsServerData>({
    queryKey: ["blogitems", apiUrl],
    queryFn: async () => {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return await response.json();
    },
  });

  // if (data) {
  //   validateSchemaToData<ServerData>(ServerDataSchema, data);
  //   try {
  //     v.parse(ServerDataSchema, data);
  //   } catch (error) {
  //     if (v.isValiError(error)) {
  //       console.error(
  //         "**** Client-side expectations do not match what the server returned ****"
  //       );
  //       console.error("Server data:", data);
  //       console.error("Expected schema:", ServerDataSchema);
  //       console.log("Study the error to see what's different", error);
  //     }
  //     throw error;
  //   }
  // }

  return (
    <div>
      {isPending && <LoadingOverlay />}

      {error && (
        <Alert color="red">Failed to load blogitems: {error.message}</Alert>
      )}

      {data && (
        <ListTable
          data={data}
          orderBy={orderBy}
          search={search}
          updateSearch={(s: string) => {
            const sp = new URLSearchParams(searchString);

            const existing = sp.get("search");
            if (s.trim() && s !== existing) {
              // if (existing?.includes(s)) {
              //   console.log("TOGGLE?", { s, existing });
              // }
              sp.set("search", s);
            } else {
              sp.delete("search");
            }
            navigate(sp.toString() ? `?${sp.toString()}` : location);
          }}
        />
      )}
    </div>
  );
}
