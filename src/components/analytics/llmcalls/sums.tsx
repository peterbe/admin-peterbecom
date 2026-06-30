import { BarChart, LineChart } from "@mantine/charts"
import {
  Alert,
  Box,
  LoadingOverlay,
  MultiSelect,
  SegmentedControl,
  Select,
  Table,
  Text,
  Title,
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

type ChartData = Record<string, number | string>[]
type ChartSeries = { name: string; color: string }[]

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

  const chartDataMap: Record<string, Record<string, number>> = {}
  for (const agg of data.aggregates) {
    const date = monthFormatter(new Date(agg.month))
    if (!(date in chartDataMap)) {
      chartDataMap[date] = {}
    }
    chartDataMap[date][agg.model] = agg.avg_took_seconds
  }

  const chartData: ChartData = Object.entries(chartDataMap).map(
    ([date, models]) => {
      return { date, ...models }
    },
  )
  const names = chartData
    .map((thing) => {
      const { date, ...rest } = thing
      return rest
    })
    .flatMap(Object.keys)
    .filter((v, i, a) => a.indexOf(v) === i)
  const colors = [
    "violet.6",
    "blue.6",
    "teal.6",
    "green.6",
    "yellow.6",
    "orange.6",
    "red.6",
    "pink.6",
  ]
  const chartSeries: ChartSeries = names.map((name, i) => ({
    name,
    color: colors[i % colors.length],
  }))

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
      <Table mb={75}>
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

      {chartData && (
        <>
          <Title order={2} mb="md">
            Average Time
          </Title>

          <LineChart
            h={500}
            data={chartData}
            dataKey="date"
            series={chartSeries}
            withLegend
            curveType="linear"
            valueFormatter={(value) => `${value.toFixed(1)}s`}
          />

          <Title order={3} mb="xs" mt={60}>
            In the last month
          </Title>
          <Title order={4} mb="md">
            Average times (smaller the better)
          </Title>

          <BarChartWrapper chartData={chartData} chartSeries={chartSeries} />
        </>
      )}
    </Box>
  )
}

function BarChartWrapper({
  chartData,
  chartSeries,
}: {
  chartData: ChartData
  chartSeries: ChartSeries
}) {
  const [sortBy, setSortBy] = useState<"name" | "-name" | "value" | "-value">(
    "value",
  )

  const months = chartData.map((thing) => thing.date)
  const monthOptions = months.map((month, i) => ({
    label: String(month),
    value: String(i),
  }))
  const [index, setIndex] = useState(chartData.length - 1)
  const [excludedModels, setExcludedModels] = useState<string[]>([])
  const lastMonth = Object.fromEntries(
    Object.entries(chartData[index]).filter(
      ([key, _]) => key === "date" || !excludedModels.includes(key),
    ),
  )

  const filteredChartSeries = chartSeries
    .filter((s) => !excludedModels.includes(s.name))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "-name") return b.name.localeCompare(a.name)
      const x = lastMonth[a.name]
      const y = lastMonth[b.name]
      if (Number.isNaN(x) || Number.isNaN(y)) return 0
      const m = sortBy === "value" ? 1 : -1
      if (x < y) return -1 * m
      if (x > y) return 1 * m
      return 0
    })

  const excludedModelsOptions = chartSeries.map((s) => ({
    label: s.name,
    value: s.name,
  }))

  return (
    <Box>
      <BarChart
        h={400}
        data={[lastMonth]}
        dataKey="date"
        series={filteredChartSeries}
        tickLine="x"
        gridAxis="y"
        valueFormatter={(value) => `${value.toFixed(1)}s`}
        orientation="vertical"
        withBarValueLabel
      />

      <Select
        mt={20}
        label="Select month"
        value={String(index)}
        onChange={(value: string | null) => {
          if (value === null) return
          setIndex(Number(value))
        }}
        data={monthOptions}
      />
      <MultiSelect
        label="Exclude models"
        data={excludedModelsOptions}
        value={excludedModels}
        onChange={(value: string[]) => {
          setExcludedModels(value)
        }}
        clearable
      />

      <Select
        label="Sort by"
        value={sortBy}
        onChange={(value: string | null) => {
          if (value === null) return
          setSortBy(value as "name" | "-name" | "value" | "-value")
        }}
        data={[
          { label: "Name", value: "name" },
          { label: "Name (Descending)", value: "-name" },
          { label: "Value", value: "value" },
          { label: "Value (Descending)", value: "-value" },
        ]}
      />
    </Box>
  )
}
