import { useDebouncedValue } from "@mantine/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { API_BASE } from "../config"
import type { CommentsServerData } from "./comments/types"

export function blogitemQueryKey(oid: string | null) {
  return ["blogitem", oid]
}

export function blogitemPageviewsQueryKey(oid: string) {
  return ["blogitem-pageviews", oid]
}

export function commentsQueryKey(searchParams: URLSearchParams) {
  return ["comments", searchParams.toString()]
}

export function blogitemsQueryKey() {
  return ["blogitems"]
}

export function blogitemsShowAllQueryKey() {
  return ["blogitems", "show-all"]
}

export function spamSignaturesQueryKey() {
  return ["spam", "signatures"]
}

export function spamPatternsQueryKey() {
  return ["spam", "patterns"]
}

export function commentClassificationQueryKey(oid: string) {
  return ["classify", oid]
}

export function commentsCountQueryKey() {
  return ["count-unapproved-comments"]
}

export function whoamiQueryKey() {
  return ["whoami"]
}

export function categoriesQueryKey() {
  return ["categories"]
}

export function cdnProbeQueryKey(search: string) {
  return ["cdn", "probe", search]
}

export function cdnPurgeURLsQueryKey() {
  return ["cdn", "purge-urls"]
}

export function imagesQueryKey(oid: string) {
  return ["images", oid]
}

export function openGraphImagesQueryKey(oid: string) {
  return ["open-graph-image", oid]
}

export async function fetchCategories() {
  return standardFetch(`${API_BASE}/categories`)
}

export async function fetchWhoami() {
  console.log("FETCHING WHOAMI")

  return standardFetch(`${API_BASE}/whoami`)
}

export async function fetchBlogitem(oid: string) {
  const response = await fetch(`${API_BASE}/plog/${oid}`)
  if (response.status === 404) {
    return { notFound: true }
  }
  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`)
  }
  return await response.json()
}

export async function fetchSpamSignatures() {
  return standardFetch(`${API_BASE}/plog/spam/signatures`)
}

export async function fetchSpamPatterns() {
  return standardFetch(`${API_BASE}/plog/spam/patterns`)
}

export async function fetchCommentClassification(oid: string) {
  return standardFetch(`${API_BASE}/plog/comments/${oid}/classify/`)
}

export async function fetchCDNProbe(url: string) {
  return standardFetch(`${API_BASE}/cdn/probe?${new URLSearchParams({ url })}`)
}
export async function fetchCDNPurgeURLs() {
  return standardFetch(`${API_BASE}/cdn/purge/urls`)
}

export async function fetchCDNPurge(urls: string[]) {
  const formData = new FormData()
  for (const url of urls) {
    formData.append("urls", url)
  }
  const response = await fetch(`${API_BASE}/cdn/purge`, {
    method: "POST",
    body: formData,
  })
  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`)
  }
  return response.json()
}

async function standardFetch(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`)
  }
  return response.json()
}

export async function fetchAnalyticsQuery(query: string) {
  const response = await fetch(
    `${API_BASE}/analytics/query?${new URLSearchParams({ query })}`,
  )
  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`)
  }
  return await response.json()
}

export async function fetchShowAllBlogitems() {
  const sp = new URLSearchParams({ show: "all" })
  const response = await fetch(`${API_BASE}/plog/?${sp}`)
  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`)
  }
  return response.json()
}

export async function fetchCommentsCount() {
  return fetchComments(
    new URLSearchParams({ unapproved: "only", count: "true" }),
  )
}

export async function fetchComments(search: URLSearchParams) {
  const copy = new URLSearchParams(search)
  if (copy.get("only") === "unapproved") {
    copy.set("unapproved", "only")
    copy.delete("only")
  } else if (copy.get("only") === "autoapproved") {
    copy.set("autoapproved", "only")
    copy.delete("only")
  }

  const response = await fetch(`${API_BASE}/plog/comments/?${copy}`)
  if (response.status === 403 && search.get("count") === "true") {
    return {
      count: 0,
      comments: [],
      oldest: "",
    }
  }
  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`)
  }
  return (await response.json()) as CommentsServerData
}

export async function batchSubmitComments({
  approve,
  _delete,
}: {
  approve: string[]
  _delete: string[]
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
  })
  if (response.status === 400) {
    let message = "400 Validation error"
    try {
      const json = await response.json()
      message += ` (${JSON.stringify(json)})`
    } catch (e) {
      console.warn("Unabled to format json error", e)
    }
    throw new Error(message)
  }
  if (response.status >= 500) {
    throw new Error(`${response.status} on ${response.url}`)
  }
  return response.json()
}

export function usePrefetchBlogitem() {
  const queryClient = useQueryClient()

  const [prefetchSoon, setPrefetchSoon] = useState<string | null>(null)
  const [debounced] = useDebouncedValue(prefetchSoon, 500)
  const prefetchBlogitemSoon = (oid: string) => {
    setPrefetchSoon(oid)
  }
  const dontPrefetchBlogitemSoon = (oid: string) => {
    setPrefetchSoon((previous) => (previous === oid ? null : previous))
  }

  useEffect(() => {
    if (debounced) {
      queryClient.prefetchQuery({
        queryKey: blogitemQueryKey(debounced),
        queryFn: async () => fetchBlogitem(debounced),
        // Prefetch only fires when data is older than the staleTime,
        // so in a case like this you definitely want to set one
        staleTime: 5 * 1000,
      })
    }
  }, [debounced, queryClient])

  return { prefetchBlogitemSoon, dontPrefetchBlogitemSoon }
}
