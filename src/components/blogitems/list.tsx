import { Alert, Box } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import { useLocalStorage } from "@mantine/hooks";
import { useLocation, useSearch } from "wouter";
import { API_BASE } from "../../config";
import type { BlogitemsServerData } from "../../types";
import { ListTable } from "./list-table";
import { PaginationSize } from "./pagination-size";

const DEFAULT_SIZE = "10";

export function List() {
  const [location, navigate] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const [paginationSize, setPaginationSize] = useLocalStorage<string>({
    key: "pagination-size",
    defaultValue: DEFAULT_SIZE,
  });
  const search = searchParams.get("search") || "";
  const orderBy = searchParams.get("orderBy") || "modify_date";

  const sp = new URLSearchParams({
    search,
    order: orderBy,
    batch_size: `${paginationSize}`,
  });
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

  const blogitems = data?.blogitems || [];
  const pageviews = useRecentPageviews(blogitems);
  console.log(pageviews);

  return (
    <Box>
      {error && (
        <Alert color="red">Failed to load blogitems: {error.message}</Alert>
      )}

      <ListTable
        isPending={isPending}
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
        pageviews={pageviews}
      />

      <PaginationSize
        value={paginationSize}
        setValue={setPaginationSize}
        disabled={!data || data.blogitems.length === 0}
      />
    </Box>
  );
}
