import {
  Alert,
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
import { API_BASE } from "../../config"
import type { SpamSignature } from "../../types"
import { fetchSpamSignatures, spamSignaturesQueryKey } from "../api-utils"
import { DisplayDate } from "../blogitems/list-table"

type ServerData = {
  signatures: SpamSignature[]
}
export function ListSignatures() {
  const { data, error, isPending } = useQuery<ServerData>({
    queryKey: spamSignaturesQueryKey(),
    queryFn: fetchSpamSignatures,
  })

  return (
    <Box mb={50} pos="relative">
      <LoadingOverlay visible={isPending} />

      {error && <Alert color="red">Error: {error.message}</Alert>}
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Kills</Table.Th>
            <Table.Th>Modified</Table.Th>
            <Table.Th> </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.signatures && data?.signatures.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={4} p={50}>
                <Text ta="center" fs="italic">
                  No signatures
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
          {data?.signatures.map((signature) => {
            return (
              <Table.Tr key={signature.id}>
                <Table.Td>
                  {signature.name === null ? (
                    <em>null</em>
                  ) : (
                    <Code>{signature.name}</Code>
                  )}
                </Table.Td>
                <Table.Td>
                  {signature.email === null ? (
                    <em>null</em>
                  ) : (
                    <Code>{signature.email}</Code>
                  )}
                </Table.Td>
                <Table.Td>{signature.kills}</Table.Td>
                <Table.Td>
                  <DisplayDate date={signature.modify_date} />
                </Table.Td>
                <Table.Td>
                  <DeleteSignatureButton id={signature.id} />
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Box>
  )
}

function DeleteSignatureButton({ id }: { id: number }) {
  const queryClient = useQueryClient()
  const [confirmed, setConfirmed] = useState(false)
  const { mutate, isPending, error } = useMutation({
    mutationKey: ["delete-signature", id],
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/spam/signatures?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        return response.json()
      }
      throw new Error(`${response.status} on ${response.url}`)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: spamSignaturesQueryKey(),
      })
    },
  })

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
      </Group>
    </>
  )
}
