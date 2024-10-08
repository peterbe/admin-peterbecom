import { useDebouncedValue } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { API_BASE } from "../config";

export function blogitemQueryKey(oid: string | null) {
  return ["blogitem", oid];
}

export async function fetchBlogitem(oid: string) {
  const response = await fetch(`${API_BASE}/plog/${oid}`);
  if (response.status === 404) {
    return { notFound: true };
  }
  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`);
  }
  return await response.json();
}

export function usePrefetchBlogitem() {
  const queryClient = useQueryClient();

  const [prefetchSoon, setPrefetchSoon] = useState<string | null>(null);
  const [debounced] = useDebouncedValue(prefetchSoon, 500);
  const prefetchBlogitemSoon = (oid: string) => {
    setPrefetchSoon(oid);
  };
  const dontPrefetchBlogitemSoon = (oid: string) => {
    setPrefetchSoon((previous) => (previous === oid ? null : previous));
  };

  useEffect(() => {
    if (debounced) {
      console.log("Prefetching", debounced);

      queryClient.prefetchQuery({
        queryKey: blogitemQueryKey(debounced),
        queryFn: async () => fetchBlogitem(debounced),
        // Prefetch only fires when data is older than the staleTime,
        // so in a case like this you definitely want to set one
        staleTime: 5 * 1000,
      });
    }
  }, [debounced, queryClient]);

  return { prefetchBlogitemSoon, dontPrefetchBlogitemSoon };
}
