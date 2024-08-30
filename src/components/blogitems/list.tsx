import { Alert, LoadingOverlay, Table } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { API_BASE } from "../../config";
import { Link } from "wouter";

type CategoryT = {
  id: number;
  name: string;
};
type BlogitemT = {
  id: number;
  oid: string;
  title: string;
  pub_date: string;
  _is_published: boolean;
  modify_date: string;
  categories: CategoryT[];
  keywords: string[];
  summary: string;
  archived: null;
};
type ServerData = {
  blogitems: BlogitemT[];
  count: number;
};

export function List() {
  const [search, setSearch] = useState("");
  const { data, error, isPending } = useQuery<ServerData>({
    queryKey: ["blogitems", search],
    queryFn: async () => {
      //admin.peterbe.com/api/v0/plog/?search=react
      const sp = new URLSearchParams({ search });
      const response = await fetch(`${API_BASE}/plog/?${sp}`);
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return await response.json();
    },
  });

  return (
    <div>
      {isPending && <LoadingOverlay />}

      {error && (
        <Alert color="red">Failed to load blogitems: {error.message}</Alert>
      )}

      {data && <ListTable data={data} />}
    </div>
  );
}

function ListTable({ data }: { data: ServerData }) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Title</Table.Th>
          <Table.Th>Modified</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.blogitems.map((item) => (
          <Table.Tr key={item.id}>
            <Table.Td>
              <Link href={`/plog/${item.oid}`}>{item.title}</Link>
            </Table.Td>
            <Table.Td>{item.modify_date}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
