import type { BadgeProps } from "@mantine/core"
import {
  Alert,
  Badge,
  Box,
  Button,
  CloseButton,
  Highlight,
  Loader,
  LoadingOverlay,
  Table,
  TextInput,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { IconSearch } from "@tabler/icons-react"
import { formatDistance, parseISO } from "date-fns"
import { useState } from "react"
import { Link, useSearchParams } from "react-router"
import { thousands } from "../../number-formatter"
import type { BlogitemsServerData } from "../../types"
import { usePrefetchBlogitem } from "../api-utils"
import { formatDistanceCompact } from "./format-distance-compact"
import { SearchTips } from "./search-tips"
import type { PageviewsByDate } from "./types"
import { useRecentPageviews } from "./use-pageviews"

export function ListTable({
  data,
  isPending,
  paginationSize,
}: {
  data: BlogitemsServerData | undefined
  isPending: boolean
  paginationSize: number
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get("search") || ""

  function updateSearch(s: string) {
    const sp = new URLSearchParams(searchParams)
    const existing = sp.get("search")
    if (s.trim() && s !== existing) {
      sp.set("search", s)
    } else {
      sp.delete("search")
    }
    setSearchParams(sp)
  }

  function toggleCategory(name: string) {
    const newSearch = /\s/.test(name)
      ? `category:"${name}"`
      : `category:${name}`

    if (search.includes(newSearch)) {
      updateSearch(search.replace(newSearch, ""))
    } else {
      updateSearch(`${search} ${newSearch}`.trim())
    }
  }

  function addQueryString(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(params)) {
      sp.set(key, value)
    }
    return `?${sp}`
  }

  const matchesMobile = useMediaQuery("(max-width: 500px)")

  const [showTips, setShowTips] = useState(false)

  const { prefetchBlogitemSoon, dontPrefetchBlogitemSoon } =
    usePrefetchBlogitem()

  let freeFormSearch = search

  let requireSummary: null | boolean = null
  const summaryRegex = search.match(/\b(has|no):summary\b/i)
  if (summaryRegex) {
    requireSummary = (summaryRegex[1] as string).toLowerCase() === "has"
    freeFormSearch = freeFormSearch.replace(summaryRegex[0], "").trim()
  }

  let requireArchived: null | boolean = null
  const archivedRegex = search.match(/\b(is|not):archived\b/i)
  if (archivedRegex) {
    requireArchived = (archivedRegex[1] as string).toLowerCase() === "is"
    freeFormSearch = freeFormSearch.replace(archivedRegex[0], "").trim()
  }

  let isFuture: null | boolean = null
  const futureRegex = search.match(/\b(is|not):future\b/i)
  if (futureRegex) {
    isFuture = (futureRegex[1] as string).toLowerCase() === "is"
    freeFormSearch = freeFormSearch.replace(/\b(is|not):future\b/i, "").trim()
  }

  let requirePublished: null | boolean = null
  const publishedRegex = search.match(/\b(is|not):published\b/i)
  if (publishedRegex) {
    requirePublished = (publishedRegex[1] as string).toLowerCase() === "is"
    freeFormSearch = freeFormSearch.replace(publishedRegex[0], "").trim()
  }

  const categories: string[] = []
  const categoryRegex = /\bcat(?:egory)?:(?:"([^"]*)"|(\S+))/g
  let m: RegExpExecArray | null = categoryRegex.exec(search)

  while (m) {
    categories.push((m[1] || m[2]) as string)
    freeFormSearch = freeFormSearch.replace(m[0], "").trim()
    m = categoryRegex.exec(search)
  }

  const orderBy = searchParams.get("orderBy") || "modify_date"
  const searchRegex = freeFormSearch.trim()
    ? new RegExp(`\\b${freeFormSearch.trim()}`, "i")
    : null

  const filteredBlogitems = (data?.blogitems || [])
    .filter((item) => {
      if (requireSummary !== null) {
        if (requireSummary && !item.summary) return false
        if (!requireSummary && item.summary) return false
      }

      if (requireArchived !== null) {
        if (requireArchived && !item.archived) return false
        if (!requireArchived && item.archived) return false
      }

      if (requirePublished !== null) {
        if (requirePublished && !item._is_published) return false
        if (!requirePublished && item._is_published) return false
      }
      if (categories.length > 0) {
        if (
          !categoryOverlap(
            categories,
            item.categories.map((c) => c.name),
          )
        ) {
          return false
        }
      }

      if (isFuture !== null) {
        const pubDate = new Date(item.pub_date)
        const now = new Date()
        if (isFuture && pubDate <= now) return false
        if (!isFuture && pubDate > now) return false
      }

      if (searchRegex) {
        return searchRegex.test(item.title)
      }
      return true
    })
    .toSorted((a, b) => {
      const reverse = orderBy.startsWith("-") ? -1 : 1
      if (orderBy.endsWith("pub_date")) {
        return (
          (new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime()) *
          reverse
        )
      }
      return (
        (new Date(b.modify_date).getTime() -
          new Date(a.modify_date).getTime()) *
        reverse
      )
    })

  const pageviews = useRecentPageviews(filteredBlogitems)

  return (
    <Box pos="relative" style={{ minHeight: 100 }}>
      <LoadingOverlay visible={isPending} />

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Pageviews</Table.Th>
            <Table.Th
              // For long date displays like "about 2 months ago"
              style={!matchesMobile ? { minWidth: 170 } : undefined}
            >
              {orderBy.endsWith("pub_date") && (
                <Link to={addQueryString({ orderBy: "modify_date" })}>
                  Published
                </Link>
              )}
              {orderBy.endsWith("modify_date") && (
                <Link to={addQueryString({ orderBy: "pub_date" })}>
                  Modified
                </Link>
              )}{" "}
              <Link
                to={addQueryString({
                  orderBy: orderBy.startsWith("-")
                    ? orderBy.slice(1)
                    : `-${orderBy}`,
                })}
              >
                {orderBy.startsWith("-") ? "▼" : "▲"}
              </Link>
            </Table.Th>
          </Table.Tr>
          <Table.Tr>
            <Table.Td colSpan={2}>
              <SearchInput disabled={isPending} key={search} />
            </Table.Td>
            <Table.Th>
              <Button variant="default" onClick={() => setShowTips((p) => !p)}>
                Search tips
              </Button>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        {showTips && (
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={3}>
                <SearchTips
                  append={(s: string) => {
                    console.warn("Not implemented", { s })
                    if (search.includes(s)) {
                      updateSearch(search.replace(s, ""))
                    } else {
                      updateSearch(`${search} ${s}`.trim())
                    }
                  }}
                />
                <Button onClick={() => setShowTips(false)}>Close</Button>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        )}
        {data && (
          <Table.Tbody>
            {filteredBlogitems.slice(0, paginationSize).map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Link
                    to={`/plog/${item.oid}`}
                    onMouseOver={() => prefetchBlogitemSoon(item.oid)}
                    onMouseOut={() => dontPrefetchBlogitemSoon(item.oid)}
                  >
                    {search ? (
                      <Highlight highlight={freeFormSearch} component="span">
                        {item.title}
                      </Highlight>
                    ) : (
                      item.title
                    )}
                  </Link>

                  {item.categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant="light"
                      color="gray"
                      ml={5}
                      style={{ textTransform: "none", pointer: "cursor" }}
                      onClick={() => {
                        toggleCategory(category.name)
                      }}
                    >
                      {category.name}
                    </Badge>
                  ))}

                  {!item.summary && (
                    <CustomBadge
                      variant="default"
                      ml={15}
                      style={{ textTransform: "none" }}
                    >
                      No summary
                    </CustomBadge>
                  )}

                  {item.archived && (
                    <CustomBadge color="red">Archived</CustomBadge>
                  )}

                  {!item._is_published ? (
                    <CustomBadge color="orange">
                      Published{" "}
                      <DisplayDate
                        date={item.pub_date}
                        compact={matchesMobile}
                      />
                    </CustomBadge>
                  ) : null}
                </Table.Td>
                <Table.Td>
                  {(pageviews.get(item.oid) || []).length > 0 ? (
                    <Pageviews
                      dates={pageviews.get(item.oid) as PageviewsByDate[]}
                    />
                  ) : (
                    <Loader color="blue" size="xs" type="dots" />
                  )}
                </Table.Td>
                <Table.Td>
                  <DisplayDate
                    date={
                      orderBy.endsWith("pub_date")
                        ? item.pub_date
                        : item.modify_date
                    }
                    compact={matchesMobile}
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        )}
      </Table>

      {data && data.blogitems.length === 0 && <Alert>No items found</Alert>}
    </Box>
  )
}

function categoryOverlap(searchCategories: string[], itemCategories: string[]) {
  for (const cat of searchCategories) {
    for (const itemCat of itemCategories) {
      if (itemCat.toLowerCase().startsWith(cat.toLowerCase())) {
        return true
      }
    }
  }
  return false
}

function SearchInput({ disabled }: { disabled: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get("search") || ""
  const [value, setValue] = useState(search)
  function updateSearch(s: string) {
    const sp = new URLSearchParams(searchParams)
    const existing = sp.get("search")
    if (s.trim() && s !== existing) {
      sp.set("search", s)
    } else {
      sp.delete("search")
    }
    setSearchParams(sp)
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        updateSearch(value.trim())
      }}
    >
      <TextInput
        placeholder="Search"
        aria-label="Search"
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        radius="xl"
        disabled={disabled}
        rightSection={
          search ? (
            <CloseButton
              aria-label="Clear input"
              onClick={() => updateSearch("")}
            />
          ) : (
            <IconSearch />
          )
        }
      />
    </form>
  )
}

function CustomBadge(props: BadgeProps) {
  return <Badge ml={15} style={{ textTransform: "none" }} {...props} />
}

export function DisplayDate({
  date,
  now,
  compact = false,
  includeSeconds = false,
}: {
  date: string | Date
  now?: string
  compact?: boolean
  includeSeconds?: boolean
}) {
  if (date === null) {
    throw new Error("date is null")
  }
  const dateObj = typeof date === "string" ? parseISO(date) : date
  const nowObj = now ? parseISO(now) : new Date()

  return (
    <span title={dateObj.toString()}>
      {compact
        ? formatDistanceCompact(dateObj)
        : formatDistance(dateObj, nowObj, { addSuffix: true, includeSeconds })}
    </span>
  )
}

function Pageviews({ dates }: { dates: PageviewsByDate[] }) {
  if (dates.length === 0) {
    return <span style={{ color: "gray" }}>n/a</span>
  }
  if (dates.length === 1) {
    const first = dates[0] as PageviewsByDate
    return <span style={{ color: "green" }}>{largeNumber(first.count)}</span>
  }

  const first = dates[0] as PageviewsByDate
  const second = dates[1] as PageviewsByDate

  return <Delta first={first} second={second} />
}

function Delta({
  first,
  second,
}: {
  first: PageviewsByDate
  second: PageviewsByDate
}) {
  const delta = first.count - second.count
  if (delta === 0) {
    return <span style={{ color: "gray" }}>±0</span>
  }
  return (
    <span style={{ color: delta > 0 ? "green" : "red" }}>
      {largeNumber(second.count)} &rarr; {largeNumber(first.count)}
    </span>
  )
}

function largeNumber(n: number) {
  if (n > 10_000) {
    return `${(n / 1_000).toFixed(1)}k`
  }
  if (n > 1_000) {
    return thousands(n)
  }
  return `${n}`
}
