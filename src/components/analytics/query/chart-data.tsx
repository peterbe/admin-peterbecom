import { BarChart } from "@mantine/charts"
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
  // const [, navigate] = useLocation()
  const navigate = useNavigate()
  // const search = useSearch()
  const [searchParams] = useSearchParams()
  // const search = searchParams.get("search") || ""

  // const searchParams = new URLSearchParams(search)
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
                navigate(`?${searchParams.toString()}`)
              }}
            >
              Toggle orientation
            </Button>
          </Grid.Col>
        </Grid>
      </div>
    )
  }
  return (
    <div>
      Unknown chart type <Code>{chart}</Code>
    </div>
  )
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
