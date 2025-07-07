import { LineChart } from "@mantine/charts"
import { Alert, Box, LoadingOverlay, Switch, Text } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { thousands } from "../../number-formatter"
import type { EditBlogitemT, QueryResult } from "../../types"
import { blogitemPageviewsQueryKey, fetchAnalyticsQuery } from "../api-utils"

type Interval = "day" | "week" | "month"

// From `select min(created) from analytics where type='pageview';`
const ANALYTICS_INCEPTION_DATE = new Date("2024-07-15T00:00:00.000Z")

export default function PageviewsInner({
  blogitem,
}: {
  blogitem: EditBlogitemT
}) {
  let days = 10
  let interval: Interval = "day"
  const pubDate = new Date(blogitem.pub_date)
  const ageDays =
    (Date.now() -
      Math.max(pubDate.getTime(), ANALYTICS_INCEPTION_DATE.getTime())) /
    1000 /
    3600 /
    24
  if (ageDays > 365) {
    interval = "month"
    days = 365
  } else if (ageDays > 90) {
    interval = "week"
    days = 90
  } else if (ageDays > 30) {
    interval = "week"
    days = 30
  }

  const analyticsThisWeek = useQuery<QueryResult>({
    queryKey: [...blogitemPageviewsQueryKey(blogitem.oid), interval, days],
    queryFn: async () => {
      const pathname = `/plog/${blogitem.oid}`
      return fetchAnalyticsQuery(
        `
SELECT
    DATE_TRUNC('${interval}', created) AS date,
    COUNT(*) AS count
FROM
    analytics
WHERE
    type = 'pageview'
    AND created > now() - interval '${days} days'
    AND (data->>'pathname') = '${pathname}'
GROUP BY
    date
ORDER BY
    1 desc
LIMIT 100
      `.trim(),
      )
    },
    refetchOnWindowFocus: process.env.NODE_ENV === "development",
  })

  return (
    <Box pos="relative" style={{ minHeight: 200 }}>
      {analyticsThisWeek.error && (
        <Alert color="red">
          Failed to load blogitem: {analyticsThisWeek.error.message}
        </Alert>
      )}
      <LoadingOverlay visible={analyticsThisWeek.isPending} />
      {analyticsThisWeek.data && (
        <Graph data={analyticsThisWeek.data} interval={interval} />
      )}
    </Box>
  )
}

function Graph({ data, interval }: { data: QueryResult; interval: Interval }) {
  const [cummulative, setCummulative] = useState(false)
  if (data.rows.length === 0) {
    return (
      <div>
        <Text m={50} ta="center" fs="italic">
          Not enough data to show a graph
        </Text>
      </div>
    )
  }

  let cummX = 0
  const rows = data.rows.toReversed()
  const dataX = rows.map((row) => {
    let date = (row.date as string).split("T")[0]
    if (interval === "month") {
      const dateObject = new Date(row.date as string)
      date = dateObject.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
    }
    // a bit naughty to do a side effect in a map function, but it works
    cummX += row.count as number
    return {
      date,
      count: cummulative ? cummX : row.count,
    }
  })

  return (
    <div>
      <LineChart
        h={300}
        data={dataX}
        series={[{ name: "count", label: "Pageviews" }]}
        dataKey="date"
        type="gradient"
        gradientStops={[
          { offset: 0, color: "red.6" },
          { offset: 20, color: "orange.6" },
          { offset: 40, color: "yellow.5" },
          { offset: 70, color: "lime.5" },
          { offset: 80, color: "cyan.5" },
          { offset: 100, color: "blue.5" },
        ]}
        strokeWidth={5}
        curveType={cummulative ? "stepAfter" : "natural"}
        valueFormatter={(value) => thousands(value as number)}
        withPointLabels
      />

      <Box mt={20}>
        <Switch
          checked={cummulative}
          onChange={(event) => setCummulative(event.currentTarget.checked)}
          label="Cummulative"
        />
      </Box>
    </div>
  )
}
