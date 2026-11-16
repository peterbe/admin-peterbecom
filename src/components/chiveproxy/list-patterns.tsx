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
} from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { standardFetch } from "../api-utils"
import { DisplayDate } from "../blogitems/list-table"
import { API_URL, QUERY_KEY } from "./constants"
import type { BannedUrlPattern } from "./types"

type ServerData = {
  patterns: BannedUrlPattern[]
}

export function ListPatterns() {
  const { data, error, isPending } = useQuery<ServerData>({
    queryKey: QUERY_KEY,
    queryFn: () => standardFetch(API_URL),
  })

  return (
    <Box mb={50} pos="relative">
      <LoadingOverlay visible={isPending} />

      {error && <Alert color="red">Error: {error.message}</Alert>}
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Pattern</Table.Th>
            <Table.Th>Is Regex</Table.Th>
            <Table.Th>Case Insensitive</Table.Th>
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
                  {pattern.case_insensitive ? (
                    <Badge color="green">Y</Badge>
                  ) : (
                    <Badge color="red">N</Badge>
                  )}
                </Table.Td>
                <Table.Td>{pattern.kills}</Table.Td>
                <Table.Td>
                  <DisplayDate date={pattern.modified} />
                </Table.Td>
                <Table.Td>
                  <Group>
                    {/* <ExecuteButton id={pattern.id} /> */}
                    <DeleteButton id={pattern.id} />
                  </Group>
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Box>
  )
}

function DeleteButton({ id }: { id: number }) {
  const queryClient = useQueryClient()
  const [confirmed, setConfirmed] = useState(false)
  const { mutate, isPending, error } = useMutation({
    mutationKey: ["delete-pattern", id],
    mutationFn: async () => {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        return response.json()
      }
      throw new Error(`${response.status} on ${response.url}`)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      })
    },
  })

  return (
    <>
      {error && <Alert color="red">Error: {error.message}</Alert>}
      {!confirmed && (
        <Button
          color="orange"
          size="sm"
          title="Delete"
          onClick={() => {
            setConfirmed(true)
          }}
        >
          <IconTrash />
        </Button>
      )}

      {confirmed && (
        <Button
          size="sm"
          onClick={() => {
            setConfirmed(false)
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
            mutate()
          }}
        >
          Yes, delete
        </Button>
      )}
    </>
  )
}
