import { Badge, Button, Highlight, Table, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

import { Link } from "wouter";
import type { BlogitemsServerData } from "../../types";

export function ListTable({
  search,
  data,
  updateSearch,
}: {
  search: string;
  data: BlogitemsServerData;
  updateSearch: (s: string) => void;
}) {
  const [value, setValue] = useState(search);
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
            <Table.Th>Modified</Table.Th>
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
                      const newSearch = /\s/.test(category.name)
                        ? `category:"${category.name}"`
                        : `category:${category.name}`;
                      setValue(newSearch);
                      updateSearch(newSearch);
                    }}
                  >
                    {category.name}
                  </Badge>
                ))}

                {!item.summary && (
                  <Badge
                    variant="default"
                    ml={15}
                    style={{ textTransform: "none" }}
                  >
                    No summary
                  </Badge>
                )}

                {item.archived && (
                  <Badge ml={15} color="red" style={{ textTransform: "none" }}>
                    Archived
                  </Badge>
                )}
              </Table.Td>
              <Table.Td>{item.modify_date}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </form>
  );
}
