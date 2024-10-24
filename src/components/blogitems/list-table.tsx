import {
  Alert,
  Badge,
  Box,
  Button,
  Highlight,
  Loader,
  LoadingOverlay,
  Table,
  TextInput,
} from "@mantine/core";
import type { BadgeProps } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { formatDistance, parseISO } from "date-fns";
import { useState } from "react";

import { useMediaQuery } from "@mantine/hooks";
import { Link, useSearch } from "wouter";
import type { BlogitemsServerData } from "../../types";
import { usePrefetchBlogitem } from "../api-utils";
import { formatDistanceCompact } from "./format-distance-compact";
import { SearchTips } from "./search-tips";
import type { PageviewsByDate, PageviewsByOID } from "./types";

export function ListTable({
  search,
  orderBy,
  data,
  updateSearch,
  isPending,
  pageviews,
}: {
  search: string;
  orderBy: string;
  data: BlogitemsServerData | undefined;
  updateSearch: (s: string) => void;
  isPending: boolean;
  pageviews: PageviewsByOID;
}) {
  const [value, setValue] = useState(search);

  function toggleCategory(name: string) {
    const newSearch = /\s/.test(name)
      ? `category:"${name}"`
      : `category:${name}`;

    if (search.includes(newSearch)) {
      setValue((v) => v.replace(newSearch, ""));
      updateSearch(search.replace(newSearch, ""));
    } else {
      setValue((v) => `${v} ${newSearch}`.trim());
      updateSearch(`${search} ${newSearch}`.trim());
    }
  }

  const searchString = useSearch();

  function addQueryString(params: Record<string, string>) {
    const searchParams = new URLSearchParams(searchString);
    for (const [key, value] of Object.entries(params)) {
      searchParams.set(key, value);
    }
    return `?${searchParams}`;
  }

  const matchesMobile = useMediaQuery("(max-width: 500px)");

  const [showTips, setShowTips] = useState(false);

  const { prefetchBlogitemSoon, dontPrefetchBlogitemSoon } =
    usePrefetchBlogitem();

  return (
    <Box pos="relative" style={{ minHeight: 100 }}>
      <LoadingOverlay visible={isPending} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateSearch(value.trim());
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
                  <Link href={addQueryString({ orderBy: "modify_date" })}>
                    Published
                  </Link>
                )}
                {orderBy === "modify_date" && (
                  <Link href={addQueryString({ orderBy: "pub_date" })}>
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
                      setValue("");
                      updateSearch("");
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
                        if (v.includes(s)) return v.replace(s, "").trim();
                        return `${v} ${s}`.trim();
                      });
                    }}
                  />
                  <Button onClick={() => setShowTips(false)}>Close</Button>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          )}
          {data && (
            <Table.Tbody>
              {data.blogitems.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Link
                      href={`/plog/${item.oid}`}
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
                          toggleCategory(category.name);
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
                    {pageviews.has(item.oid) ? (
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
  );
}

function CustomBadge(props: BadgeProps) {
  return <Badge ml={15} style={{ textTransform: "none" }} {...props} />;
}

export function DisplayDate({
  date,
  now,
  compact = false,
}: {
  date: string;
  now?: string;
  compact?: boolean;
}) {
  if (date === null) {
    throw new Error("date is null");
  }
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const nowObj = now ? parseISO(now) : new Date();

  return (
    <span title={dateObj.toString()}>
      {compact
        ? formatDistanceCompact(dateObj)
        : formatDistance(dateObj, nowObj, { addSuffix: true })}
    </span>
  );
}

function Pageviews({ dates }: { dates: PageviewsByDate[] }) {
  const first = dates[0];
  if (!first) {
    return <span style={{ color: "gray" }}>n/a</span>;
  }

  return (
    <>
      {first.count} <Delta dates={dates} />
    </>
  );
}

function Delta({ dates }: { dates: PageviewsByDate[] }) {
  if (dates.length >= 2) {
    const delta = dates[0].count - dates[1].count;
    if (delta === 0) {
      return <span style={{ color: "gray" }}>±0</span>;
    }
    return delta > 0 ? (
      <span style={{ color: "green" }}>+{delta}</span>
    ) : (
      <span style={{ color: "red" }}>{delta}</span>
    );
  }
  if (dates.length === 1) {
    return <span style={{ color: "orange" }}>{dates[0].count}</span>;
  }
  return <span style={{ color: "orange" }}>n/a</span>;
}
