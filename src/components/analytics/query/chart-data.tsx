import { BarChart, PieChart } from "@mantine/charts"
import { Button, Code, Grid } from "@mantine/core"

import { useNavigate, useSearchParams } from "react-router"
import type { QueryResult } from "../types"

export function ChartData({
  name,
  data,
  chart,
}: {
  name: string
  data: QueryResult
  chart: string
}) {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const orientationRaw = searchParams.get(`${name}:orientation`) || "horizontal"
  const orientation =
    orientationRaw === "horizontal" ? "horizontal" : "vertical"

  if (chart === "bar") {
    const { data: d, key, series } = makeData(data)
    return (
      <div>
        <BarChart
          h={600}
          data={d}
          dataKey={key}
          series={series}
          tickLine="y"
          orientation={orientation}
        />
        <Grid>
          <Grid.Col>
            <Button
              onClick={() => {
                searchParams.set(
                  `${name}:orientation`,
                  orientation === "horizontal" ? "vertical" : "horizontal",
                )
                void navigate(`?${searchParams.toString()}`)
              }}
            >
              Toggle orientation
            </Button>
          </Grid.Col>
        </Grid>
      </div>
    )
  }
  if (chart === "pie") {
    const { data: d } = makePieData(data)
    return (
      <PieChart
        size={500}
        data={d}
        withLabelsLine
        labelsPosition="inside"
        labelsType="percent"
        withLabels
      />
    )
  }
  return (
    <div>
      Unknown chart type <Code>{chart}</Code>
    </div>
  )
}

function makePieData(result: QueryResult) {
  const colors = [
    "blue.5",
    "lime.5",
    "orange.6",
    "yellow.5",
    "red.6",
    "cyan.5",
    // "#e6f7ff",
    // "#d3eafb",
    // "#a9d2f1",
    // "#7bb9e9",
    // "#56a4e1",
    // "#3e97dd",
    // "#2f90dc",
    // "#1f7dc4",
    // "#0f6fb0",
    // "#00609d",
  ]

  const data: {
    name: string
    value: number
    color: string
  }[] = []

  let rest = 0
  for (const row of result.rows) {
    let first = true
    let name = ""
    for (const [key, value] of Object.entries(row).slice(0, 2)) {
      if (first) {
        first = false
        name = String(key)
        continue
      }
      const color = colors.shift()
      if (!color) {
        rest += Number(value)
        continue
      }
      data.push({
        name,
        value: Number(value),
        color,
      })
    }
  }
  if (rest) {
    data.push({ name: "Rest", value: rest, color: "gray" })
  }

  return { data }
}

type DataType = Record<string, number | string>
type Serie = {
  name: string
  color?: string
}
function makeData(data: QueryResult) {
  const d: DataType[] = []

  let firstKey = ""
  const series: Serie[] = []
  const colors: Record<string, string> = {}
  for (const row of data.rows) {
    if (!firstKey) {
      for (const key of Object.keys(row)) {
        if (!firstKey) {
          firstKey = key
        } else {
          colors[key] = "blue.6"
        }
      }
    }
    d.push(row as DataType)
  }
  for (const [name, color] of Object.entries(colors)) {
    series.push({ name, color })
  }

  const key = firstKey
  return { data: d, key, series }
}
