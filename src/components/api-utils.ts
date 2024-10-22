import { useDebouncedValue } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { API_BASE } from "../config";

export function blogitemQueryKey(oid: string | null) {
  return ["blogitem", oid];
}

export function blogitemPageviewsQueryKey(oid: string) {
  return ["blogitem-pageviews", oid];
}

export function commentsQueryKey(searchParams: URLSearchParams) {
  return ["comments", searchParams.toString()];
}

export function blogitemsQueryKey() {
  return ["blogitems"];
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

export async function fetchAnalyticsQuery(query: string) {
  const response = await fetch(
    `${API_BASE}/analytics/query?${new URLSearchParams({ query })}`,
  );
  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`);
  }
  return await response.json();
}

export async function fetchComments(search: URLSearchParams) {
  const copy = new URLSearchParams(search);
  if (copy.get("only") === "unapproved") {
    copy.set("unapproved", "only");
    copy.delete("only");
  } else if (copy.get("only") === "autoapproved") {
    copy.set("autoapproved", "only");
    copy.delete("only");
  }

  const response = await fetch(`${API_BASE}/plog/comments/?${copy}`);
  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`);
  }
  return response.json();
}

export async function batchSubmitComments({
  approve,
  _delete,
}: {
  approve: string[];
  _delete: string[];
}) {
  const response = await fetch(`${API_BASE}/plog/comments/both/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      approve,
      delete: _delete,
    }),
  });
  if (response.status >= 500) {
    throw new Error(`${response.status} on ${response.url}`);
  }
  return response.json();
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
