import {
  Alert,
  Box,
  LoadingOverlay,
  SegmentedControl,
  Table,
  Text,
  Tooltip,
} from "@mantine/core"
import { useState } from "react"
import {
  type Aggregate,
  type ServerData,
  useAnalyticsLLMCalls,
} from "./use-analytics-llmcalls"

export function Sums() {
  const { data, error, isPending } = useAnalyticsLLMCalls()

  return (
    <Box mb={50} pos="relative">
      <LoadingOverlay visible={isPending} />
      {error && <Alert color="red">Error: {error.message}</Alert>}

      {data && <SumsTable data={data} />}
    </Box>
  )
}

function SumsTable({ data }: { data: ServerData }) {
  const [value, setValue] = useState<"sum" | "month">("month")

  const estimateCost = (model: string, count: number) => {
    const pricesPerM = {
      "gpt-5": 2.5,
      "gpt-5-mini": 0.75,
      "gpt-5-nano": 0.75,
    }
    if (model in pricesPerM) {
      const pricePerM = pricesPerM[model as keyof typeof pricesPerM]
      return pricePerM * (count / 1_000_000)
    }
    return Number.NaN
  }
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  })

  const monthFormatter = (d: Date) =>
    d.toLocaleString("en-US", { month: "short", year: "numeric" })

  const timeFormatter = (seconds: number) => {
    if (seconds > 1000) {
      const minutes = seconds / 60
      return `${minutes.toFixed(1)}m`
    }
    return `${seconds.toFixed(1)}s`
  }

  const byMonth = value === "month"

  const collapseByMonth = (aggregates: ServerData["aggregates"]) => {
    const map: Record<string, Aggregate[]> = {}

    for (const aggregate of aggregates) {
      const { model, count, avg_took_seconds, sum_took_seconds } = aggregate
      if (!(model in map)) {
        map[model] = [
          { count, avg_took_seconds, sum_took_seconds, model, month: "" },
        ]
      } else {
        map[model].push({
          count,
          avg_took_seconds,
          sum_took_seconds,
          model,
          month: "",
        })
      }
    }
    const combined: Record<string, Aggregate> = {}
    for (const [model, aggregates] of Object.entries(map)) {
      combined[model] = {
        model,
        count: aggregates.reduce((acc, a) => acc + a.count, 0),
        avg_took_seconds:
          aggregates.reduce((acc, a) => acc + a.avg_took_seconds, 0) /
          aggregates.length,
        sum_took_seconds: aggregates.reduce(
          (acc, a) => acc + a.sum_took_seconds,
          0,
        ),
        month: "",
      }
    }
    return Object.values(combined)
  }

  const buckets = byMonth ? data.aggregates : collapseByMonth(data.aggregates)

  return (
    <Box>
      <SegmentedControl
        value={value}
        onChange={setValue}
        data={[
          { label: "Sum total", value: "sum" },
          { label: "By month", value: "month" },
        ]}
      />
      <Table>
        <Table.Thead>
          <Table.Tr>
            {byMonth ? <Table.Th>Month</Table.Th> : null}
            <Table.Th>Model</Table.Th>
            <Table.Th>Count</Table.Th>
            <Table.Th>Average Time</Table.Th>
            <Table.Th>Sum Time</Table.Th>
            <Table.Th>Estimated Cost</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {buckets.map((row) => {
            const cost = estimateCost(row.model, row.count)
            return (
              <Table.Tr key={`${row.model}${row.month}`}>
                {row.month ? (
                  <Table.Td>{monthFormatter(new Date(row.month))}</Table.Td>
                ) : null}
                <Table.Td>{row.model}</Table.Td>
                <Table.Td>{row.count}</Table.Td>
                <Table.Td>
                  {"avg_took_seconds" in row &&
                    timeFormatter(row.avg_took_seconds)}
                </Table.Td>
                <Table.Td>
                  {"sum_took_seconds" in row &&
                    timeFormatter(row.sum_took_seconds)}
                </Table.Td>
                <Table.Td>
                  {Number.isNaN(cost) ? (
                    "N/A"
                  ) : (
                    <Tooltip label={`${(100 * cost).toFixed(5)} cents`}>
                      <Text>{formatter.format(cost)}</Text>
                    </Tooltip>
                  )}
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
