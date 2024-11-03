import {
  Alert,
  Badge,
  Box,
  Button,
  Code,
  Group,
  LoadingOverlay,
  Table,
  Text,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { API_BASE } from "../../config";
import type { SpamPattern } from "../../types";
import { fetchSpamPatterns, spamPatternsQueryKey } from "../api-utils";
import { DisplayDate } from "../blogitems/list-table";

type ServerData = {
  patterns: SpamPattern[];
};
export function ListPatterns() {
  const { data, error, isPending } = useQuery<ServerData>({
    queryKey: spamPatternsQueryKey(),
    queryFn: fetchSpamPatterns,
  });

  return (
    <Box mb={50} pos="relative">
      <LoadingOverlay visible={isPending} />

      {error && <Alert color="red">Error: {error.message}</Alert>}
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Pattern</Table.Th>
            <Table.Th>Regex?</Table.Th>
            <Table.Th>URL?</Table.Th>
            <Table.Th>Kills</Table.Th>
            <Table.Th>Modified</Table.Th>
            <Table.Th> </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.patterns && data?.patterns.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={4} p={50}>
                <Text ta="center" fs="italic">
                  No patterns
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
          {data?.patterns.map((pattern) => {
            return (
              <Table.Tr key={pattern.id}>
                <Table.Td>
                  <Code>{pattern.pattern}</Code>
                </Table.Td>
                <Table.Td>
                  {pattern.is_regex ? (
                    <Badge color="green">Y</Badge>
                  ) : (
                    <Badge color="red">N</Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  {pattern.is_url_pattern ? (
                    <Badge color="green">Y</Badge>
                  ) : (
                    <Badge color="red">N</Badge>
                  )}
                </Table.Td>
                <Table.Td>{pattern.kills}</Table.Td>
                <Table.Td>
                  <DisplayDate date={pattern.modify_date} />
                </Table.Td>
                <Table.Td>
                  <DeleteButton id={pattern.id} />
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Box>
  );
}

function DeleteButton({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);
  const { mutate, isPending, error } = useMutation({
    mutationKey: ["delete-pattern", id],
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/plog/spam/patterns?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        return response.json();
      }
      throw new Error(`${response.status} on ${response.url}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: spamPatternsQueryKey(),
      });
    },
  });

  return (
    <>
      {error && <Alert color="red">Error: {error.message}</Alert>}
      <Group>
        {!confirmed && (
          <Button
            color="orange"
            size="sm"
            title="Delete"
            onClick={() => {
              setConfirmed(true);
            }}
          >
            <IconTrash />
          </Button>
        )}

        {confirmed && (
          <Button
            size="sm"
            onClick={() => {
              setConfirmed(false);
            }}
          >
            Cancel
          </Button>
        )}
        {confirmed && (
          <Button
            color="red"
            size="sm"
            title="Yes, delete"
            disabled={isPending}
            loading={isPending}
            onClick={() => {
              mutate();
            }}
          >
            Yes, delete
          </Button>
        )}
      </Group>
    </>
  );
}
