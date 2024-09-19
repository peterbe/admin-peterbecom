import { Badge, Button, Highlight, Table, TextInput } from "@mantine/core";
import type { BadgeProps } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { formatDistance, parseISO } from "date-fns";
import { useState } from "react";

import { useMediaQuery } from "@mantine/hooks";
import { Link, useSearch } from "wouter";
import type { BlogitemsServerData } from "../../types";
import { formatDistanceCompact } from "./format-distance-compact";

export function ListTable({
  search,
  orderBy,
  data,
  updateSearch,
}: {
  search: string;
  orderBy: string;
  data: BlogitemsServerData;
  updateSearch: (s: string) => void;
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

  return (
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
            <Table.Td>
              <TextInput
                placeholder="Search"
                aria-label="Search"
                value={value}
                onChange={(event) => setValue(event.currentTarget.value)}
                radius="xl"
                rightSection={<IconSearch />}
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
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.blogitems.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                <Link href={`/plog/${item.oid}`}>
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

                {!item._is_published ? (
                  <CustomBadge color="orange">
                    Published{" "}
                    <DisplayDate date={item.pub_date} compact={matchesMobile} />
                  </CustomBadge>
                ) : null}
              </Table.Td>
              <Table.Td>
                <DisplayDate
                  date={
                    orderBy === "pub_date" ? item.pub_date : item.modify_date
                  }
                  compact={matchesMobile}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </form>
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
