import {
  Alert,
  Anchor,
  Box,
  Button,
  Code,
  Group,
  List,
  LoadingOverlay,
  Table,
  Text,
  Title,
} from "@mantine/core"
import { Link } from "react-router-dom"
import { DisplayDate } from "../blogitems/list-table"
import type { ProbeServerData } from "./types"
import { useLookup } from "./use-lookup"
import { usePurge } from "./use-purge"

export function Lookup({ search }: { search: string }) {
  const { data, isPending, error, isRefetching, refetch, dataUpdatedAt } =
    useLookup(search)
  return (
    <Box pos="relative" mt={40}>
      <LoadingOverlay visible={isPending} />
      <Title order={2}>
        Lookup {isRefetching && <Text span>Re-probing...</Text>}
      </Title>
      {error && <Alert color="red">Error: {error.message}</Alert>}
      {data && <Purge result={data} search={search} reload={() => refetch()} />}

      {dataUpdatedAt && dataUpdatedAt > 0 && <LookedUp ts={dataUpdatedAt} />}

      {data && <LookupResult data={data} />}
    </Box>
  )
}

function LookedUp({ ts }: { ts: number }) {
  return (
    <Box mt={20}>
      <Text span size="sm">
        Looked up at <DisplayDate date={new Date(ts)} includeSeconds />
      </Text>
    </Box>
  )
}

function Purge({
  result,
  search,
  reload,
}: {
  result: ProbeServerData
  search: string
  reload: () => void
}) {
  const { data, mutate, error, isPending } = usePurge(search)
  return (
    <Box pos="relative">
      <LoadingOverlay visible={isPending} />
      {error && <Alert color="red">Error: {error.message}</Alert>}
      <Group>
        <Button onClick={reload} disabled={isPending}>
          Probe again
        </Button>
        <Button
          onClick={() => {
            mutate([result.absolute_url])
          }}
          disabled={isPending}
          loading={isPending}
        >
          Purge
        </Button>
        {result.other_pages?.length && (
          <Button
            onClick={() => {
              mutate([result.absolute_url, ...(result.other_pages || [])])
            }}
            disabled={isPending}
          >
            Purge All URLs
          </Button>
        )}
      </Group>
      {data && <pre>{JSON.stringify(data, undefined, 2)}</pre>}
    </Box>
  )
}

function LookupResult({ data }: { data: ProbeServerData }) {
  return (
    <Box mt={40}>
      <Table>
        <Table.Tbody>
          <Table.Tr>
            <Table.Th>Absolute URL</Table.Th>
            <Table.Td>
              <Anchor href={data.absolute_url}>
                <Code>{data.absolute_url}</Code>
              </Anchor>{" "}
              <Anchor
                size="sm"
                href={`https://tools.keycdn.com/performance?${new URLSearchParams(
                  { url: data.absolute_url },
                )}`}
              >
                KeyCDN Performance Text
              </Anchor>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Status code</Table.Th>
            <Table.Td>
              <Code>{data.http_1.status_code}</Code>{" "}
              <Text span size="sm">
                (took {data.http_1.took.toFixed(2)}sec)
              </Text>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>X-Cache</Table.Th>
            <Table.Td>
              <Code>{data.http_1.x_cache}</Code>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
      {data.other_pages && (
        <List>
          {data.other_pages.map((page) => {
            return (
              <List.Item key={page}>
                <Link to={`?${new URLSearchParams({ search: page })}`}>
                  {page}
                </Link>
              </List.Item>
            )
          })}
        </List>
      )}
      <Title order={4} mt={50}>
        Headers
      </Title>

      <Table>
        <Table.Tbody>
          {Object.entries(data.http_1.headers).map(([header, value]) => {
            return (
              <Table.Tr key={header}>
                <Table.Th>{header}</Table.Th>
                <Table.Td>
                  <Code>{value}</Code>
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
