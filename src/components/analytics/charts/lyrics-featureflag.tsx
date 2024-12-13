import { BarChart } from "@mantine/charts"
import { Box, Grid, SegmentedControl } from "@mantine/core"
import { useState } from "react"

import { ChartContainer } from "./container"
import { IntervalOptions } from "./interval-options"
import type { DataSerie } from "./line-chart"
import { Loading } from "./loading"
import { useInterval } from "./use-interval"
import { useQuery } from "./use-query"

export function LyricsFeatureflag() {
  return (
    <ChartContainer id="lyrics-featureflag" title="Lyrics Featureflag">
      <Inner />
    </ChartContainer>
  )
}

const sqlQuery = (days = 7) => `
SELECT
    DATE_TRUNC('day', created) AS day,
    data->>'enabled' AS enabled,
    COUNT(url) AS count
FROM
    analytics
WHERE
    type='lyrics-featureflag'
    and created > now() - interval '${days + 1} days'
GROUP BY
    day,
    data->>'enabled'
ORDER BY day
`

function Inner() {
  const [intervalDays, setIntervalDays] = useInterval("lyrics-featureflag")
  const [percentMode, setPercentMode] = useState("")

  const current = useQuery(sqlQuery(Number(intervalDays)))

  const dataX: {
    date: string
    true: number
    false: number
  }[] = []
  const series: DataSerie[] = [
    { name: "true", label: "Yes", color: "green" },
    { name: "false", label: "No", color: "red" },
  ]
  if (current.data) {
    const buckets: {
      [date: string]: {
        [enabled: string]: number
      }
    } = {}
    for (const row of current.data.rows) {
      const d = new Date(row.day as string)
      const k = `${d.toLocaleString("en-US", {
        month: "short",
      })} ${d.getDate()}`
      if (!(k in buckets)) buckets[k] = {}
      buckets[k][row.enabled as string] = row.count as number
    }
    for (const [date, numbers] of Object.entries(buckets)) {
      dataX.push({
        date,
        true: numbers.true || 0,
        false: numbers.false || 0,
      })
    }
  }

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading} />

        {!current.error && (
          <BarChart
            h={400}
            data={dataX}
            dataKey="date"
            series={series}
            type={percentMode === "percent" ? "percent" : undefined}
            valueFormatter={(value) =>
              new Intl.NumberFormat("en-US").format(value)
            }
            // tickLine="y"
          />
        )}
      </Box>

      <Grid>
        <Grid.Col span={12}>
          <IntervalOptions value={intervalDays} onChange={setIntervalDays} />
        </Grid.Col>
        <Grid.Col span={6}>
          <SegmentedControl
            value={percentMode}
            onChange={setPercentMode}
            withItemsBorders={false}
            transitionDuration={300}
            transitionTimingFunction="linear"
            data={[
              { label: "Side-by-side", value: "" },
              { label: "Percent mode", value: "percent" },
            ]}
          />
        </Grid.Col>
      </Grid>
    </>
  )
}
