import { Alert, Box, LoadingOverlay } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import { useLocation, useSearch } from "wouter";
import { API_BASE } from "../../config";
import type { BlogitemsServerData } from "../../types";
import { ListTable } from "./list-table";

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

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isPending} />

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
              sp.set("search", s);
            } else {
              sp.delete("search");
            }
            navigate(sp.toString() ? `?${sp.toString()}` : location);
          }}
        />
      )}
    </Box>
  );
}
