import type { BadgeProps } from "@mantine/core"
import {
  Alert,
  Badge,
  Box,
  Button,
  Highlight,
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

export function ListTable({
  // search,
  // orderBy,
  data,
  // updateSearch,
  isPending,
  // pageviews,
  paginationSize,
}: {
  // search: string
  // orderBy: string
  data: BlogitemsServerData | undefined
  // updateSearch: (s: string) => void
  isPending: boolean
  // pageviews: PageviewsByOID
  paginationSize: number
}) {
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

  function toggleCategory(name: string) {
    console.log("TOGGLE CATEGORY", name)
    //   const newSearch = /\s/.test(name)
    //     ? `category:"${name}"`
    //     : `category:${name}`

    //   if (search.includes(newSearch)) {
    //     setValue((v) => v.replace(newSearch, ""))
    //     updateSearch(search.replace(newSearch, ""))
    //   } else {
    //     setValue((v) => `${v} ${newSearch}`.trim())
    //     updateSearch(`${search} ${newSearch}`.trim())
    //   }
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

  // const schema: Schema = {
  //   title: { type: "string", alias: "t" },
  //   modify_date: { type: "string" },
  //   pub_date: { type: "string" },
  //   // year: { type: "number", alias: "y" },
  //   // monitored: { type: "boolean", alias: "m" },
  //   // rating: { type: "number" },
  //   // genre: { type: "string" },
  // }

  // const filterql = new FilterQL({
  //   schema,
  //   // options: {
  //   //   allowUnknownFields: false,
  //   // },
  // })
  // console.log({ search })
  const orderBy = searchParams.get("orderBy") || "modify_date"
  const searchRegex = new RegExp(`\\b${search}`, "i")
  // const filteredBlogitems = filterql.query(data?.blogitems || [], search)
  const filteredBlogitems = (data?.blogitems || [])
    .filter((item) => {
      if (searchRegex) {
        return searchRegex.test(item.title)
      }
      return true
    })
    .toSorted((a, b) => {
      if (orderBy === "pub_date") {
        return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime()
      }
      return (
        new Date(b.modify_date).getTime() - new Date(a.modify_date).getTime()
      )
    })

  return (
    <Box pos="relative" style={{ minHeight: 100 }}>
      <LoadingOverlay visible={isPending} />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          updateSearch(value.trim())
        }}
      >
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Pageviews</Table.Th>
              <Table.Th
                // For long date displays like "about 2 months ago"
                style={!matchesMobile ? { minWidth: 170 } : undefined}
              >
                {orderBy === "pub_date" && (
                  <Link to={addQueryString({ orderBy: "modify_date" })}>
                    Published
                  </Link>
                )}
                {orderBy === "modify_date" && (
                  <Link to={addQueryString({ orderBy: "pub_date" })}>
                    Modified
                  </Link>
                )}
              </Table.Th>
            </Table.Tr>
            <Table.Tr>
              <Table.Td colSpan={2}>
                <TextInput
                  placeholder="Search"
                  aria-label="Search"
                  value={value}
                  onChange={(event) => setValue(event.currentTarget.value)}
                  radius="xl"
                  rightSection={<IconSearch />}
                  disabled={isPending}
                />
              </Table.Td>
              <Table.Th>
                {search && (
                  <Button
                    onClick={() => {
                      setValue("")
                      updateSearch("")
                    }}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  variant="default"
                  onClick={() => setShowTips((p) => !p)}
                >
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
                      setValue((v) => {
                        if (v.includes(s)) return v.replace(s, "").trim()
                        return `${v} ${s}`.trim()
                      })
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
                        <Highlight highlight={search} component="span">
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
                    {!item.has_split && (
                      <CustomBadge color="yellow">No split</CustomBadge>
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
                    {/* {(pageviews.get(item.oid) || []).length > 0 ? (
                      <Pageviews
                        dates={pageviews.get(item.oid) as PageviewsByDate[]}
                      />
                    ) : (
                      <Loader color="blue" size="xs" type="dots" />
                    )} */}
                  </Table.Td>
                  <Table.Td>
                    <DisplayDate
                      date={
                        orderBy === "pub_date"
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
      </form>
    </Box>
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

function _Pageviews({ dates }: { dates: PageviewsByDate[] }) {
  if (dates.length === 0) {
    return <span style={{ color: "gray" }}>n/a</span>
  }
  if (dates.length === 1) {
    const first = dates[0]
    return <span style={{ color: "green" }}>{largeNumber(first.count)}</span>
  }

  return <Delta first={dates[0]} second={dates[1]} />
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
