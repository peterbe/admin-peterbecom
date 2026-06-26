import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Code,
  Container,
  Group,
  Loader,
  LoadingOverlay,
  Modal,
  Select,
  Table,
  Title,
} from "@mantine/core"
import { useLocalStorage, useMediaQuery } from "@mantine/hooks"
import { IconReload } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useSearchParams } from "react-router"
import { fetchLLMCalls } from "../api-utils"
import { DisplayDate } from "../blogitems/list-table"
import { Took } from "../utils/took"
import type { ServerData } from "./types"

const badgeColor = (status: string) => {
  if (status === "success") return "green"
  if (status === "error") return "red"
  if (status === "progress") return "yellow"
  return "blue"
}

export function List() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [batchSize, setBatchSize] = useLocalStorage({
    key: "llmcalls-table-page-size",
    defaultValue: "100",
  })

  const filterSearchParams = new URLSearchParams(searchParams)
  if (batchSize) {
    filterSearchParams.set("batch_size", batchSize)
  }

  const { data, error, isPending, refetch, isRefetching } =
    useQuery<ServerData>({
      queryKey: ["llmcalls", filterSearchParams.toString()],
      queryFn: async () => {
        return fetchLLMCalls(filterSearchParams)
      },
      refetchOnWindowFocus: true,
    })

  const matchesMobile = useMediaQuery("(max-width: 500px)")
  const [messages, setMessages] = useState<object[] | null>(null)
  const [response, setResponse] = useState<object | null>(null)
  const [metadata, setMetadata] = useState<object | null>(null)
  const [responseError, setResponseError] = useState<object | null>(null)

  const statusAggregates = data
    ? Object.entries(data.aggregates.status).map(([status, count]) => ({
        value: status || "*empty*",
        label: `${status || "*empty*"} (${count})`,
      }))
    : []

  const useCaseAggregates = data
    ? Object.entries(data.aggregates.use_case).map(([useCase, count]) => ({
        value: useCase || "*empty*",
        label: `${useCase || "*empty*"} (${count})`,
      }))
    : []

  const modelAggregates = data
    ? Object.entries(data.aggregates.model).map(([model, count]) => ({
        value: model || "*empty*",
        label: `${model || "*empty*"} (${count})`,
      }))
    : []

  return (
    <Box mb={50} pos="relative">
      <Group justify="space-between">
        <Title>LLM Calls {data ? `(${data.count})` : ""}</Title>
        {/* <Button onClick={() => refetch()}>Refetch</Button> */}
        {isRefetching && <Loader size={26} />}
        {data && !isRefetching && (
          <ActionIcon
            variant="filled"
            aria-label="Refetch"
            onClick={() => refetch()}
          >
            <IconReload style={{ width: "70%", height: "70%" }} />
          </ActionIcon>
        )}
      </Group>
      <LoadingOverlay visible={isPending} />

      {error && <Alert color="red">Error: {error.message}</Alert>}

      <Modal
        size="auto"
        opened={Boolean(messages)}
        onClose={() => setMessages(null)}
        title="Messages"
      >
        {messages && <pre>{JSON.stringify(messages, null, 2)}</pre>}
      </Modal>
      <Modal
        size="auto"
        opened={Boolean(response)}
        onClose={() => setResponse(null)}
        title="Response"
      >
        {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
      </Modal>
      <Modal
        size="auto"
        opened={Boolean(metadata)}
        onClose={() => setMetadata(null)}
        title="Metadata"
      >
        {metadata && <pre>{JSON.stringify(metadata, null, 2)}</pre>}
      </Modal>
      <Modal
        size="auto"
        opened={Boolean(responseError)}
        onClose={() => setResponseError(null)}
        title="Error"
      >
        {responseError && <pre>{JSON.stringify(responseError, null, 2)}</pre>}
      </Modal>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Status</Table.Th>
            <Table.Th>Use Case</Table.Th>
            <Table.Th>Model</Table.Th>
            <Table.Th> </Table.Th>
            <Table.Th>Took</Table.Th>
            <Table.Th>Created</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>
              <Select
                size="xs"
                clearable
                loading={isPending}
                placeholder="Status"
                data={statusAggregates}
                value={searchParams.get("status") || ""}
                onChange={(value) => {
                  if (value === null || value === "") {
                    searchParams.delete("status")
                  } else {
                    searchParams.set("status", value)
                  }
                  setSearchParams(searchParams)
                }}
              />
            </Table.Td>
            <Table.Td>
              <Select
                size="xs"
                clearable
                loading={isPending}
                placeholder="Use Case"
                data={useCaseAggregates}
                value={searchParams.get("use_case") || ""}
                onChange={(value) => {
                  if (value === null || value === "") {
                    searchParams.delete("use_case")
                  } else {
                    searchParams.set("use_case", value)
                  }
                  setSearchParams(searchParams)
                }}
              />
            </Table.Td>
            <Table.Td>
              <Select
                size="xs"
                clearable
                loading={isPending}
                placeholder="Model"
                data={modelAggregates}
                value={searchParams.get("model") || ""}
                onChange={(value) => {
                  if (value === null || value === "") {
                    searchParams.delete("model")
                  } else {
                    searchParams.set("model", value)
                  }
                  setSearchParams(searchParams)
                }}
              />
            </Table.Td>
          </Table.Tr>
          {data?.calls.map((llmcall) => {
            return (
              <Table.Tr key={llmcall.id}>
                <Table.Td>
                  <StatusBadge status={llmcall.status} />
                </Table.Td>
                <Table.Td>
                  <Code>{llmcall.use_case}</Code>
                </Table.Td>
                <Table.Td>
                  <Code>{llmcall.model}</Code>
                </Table.Td>
                <Table.Td>
                  <Group>
                    <Button
                      onClick={() => setMessages(llmcall.messages)}
                      variant="light"
                      size="xs"
                    >
                      Messages
                    </Button>
                    <Button
                      onClick={() => setResponse(llmcall.response)}
                      variant="light"
                      size="xs"
                    >
                      Response
                    </Button>
                    <Button
                      onClick={() => setMetadata(llmcall.metadata)}
                      variant="light"
                      size="xs"
                    >
                      Metadata
                    </Button>
                    {llmcall.error && (
                      <Button
                        onClick={() => setResponseError(llmcall.error)}
                        variant="light"
                        color="red"
                        size="xs"
                      >
                        Error
                      </Button>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  {llmcall.status === "progress" ? (
                    "n/a"
                  ) : (
                    <Took seconds={llmcall.took_seconds} />
                  )}
                </Table.Td>
                <Table.Td>
                  <DisplayDate date={llmcall.created} compact={matchesMobile} />
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>

      {!isPending && (
        <Container>
          <Select
            size="xs"
            label="Batch size"
            data={[
              { value: "10", label: "10" },
              { value: "25", label: "25" },
              { value: "50", label: "50" },
              { value: "100", label: "100" },
              { value: "1000", label: "1000" },
            ]}
            value={batchSize}
            onChange={(value: string | null) => {
              setBatchSize(value || "100")
            }}
          />
        </Container>
      )}
    </Box>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge color={badgeColor(status)} variant="light">
      {status}
    </Badge>
  )
}
