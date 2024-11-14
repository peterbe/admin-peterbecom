import { Alert, Box, LoadingOverlay, Table, Title } from "@mantine/core"
import { DisplayDate } from "../blogitems/list-table"
import { usePurgeURLs } from "./use-purge-urls"

type PurgeURL = {
  id: number
  url: string
  attempts: number
  processed: string | null
  cancelled: string | null
  created: string
}

type PurgeURLsServerData = {
  queued: PurgeURL[]
  recent: PurgeURL[]
}
export function PurgeURLs() {
  const { data, error, isPending } = usePurgeURLs<PurgeURLsServerData>()

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isPending} />

      {error && <Alert color="red">Error: {error.message}</Alert>}
      {data && <List data={data} />}
    </Box>
  )
}

function List({ data }: { data: PurgeURLsServerData }) {
  return (
    <Box>
      <Title order={4} mt={60}>
        Queued ({data.queued.length})
      </Title>
      <URLTable data={data.queued} />

      <Title order={4} mt={60}>
        Processed ({data.recent.length})
      </Title>
      <URLTable data={data.recent} />
    </Box>
  )
}

function URLTable({ data }: { data: PurgeURL[] }) {
  return (
    <Box mt={30}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>URL</Table.Th>
            <Table.Th>Attempts</Table.Th>
            <Table.Th>Created</Table.Th>
            <Table.Th>Processed</Table.Th>
            <Table.Th>Cancelled</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((url) => (
            <Table.Tr key={url.id}>
              <Table.Td>{url.url}</Table.Td>
              <Table.Td>{url.attempts}</Table.Td>
              <Table.Td>
                <DisplayDate date={url.created} />
              </Table.Td>
              <Table.Td>
                {url.processed ? (
                  <DisplayDate date={url.processed} />
                ) : (
                  <i>n/a</i>
                )}
              </Table.Td>
              <Table.Td>
                {url.cancelled ? (
                  <DisplayDate date={url.cancelled} />
                ) : (
                  <i>n/a</i>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
