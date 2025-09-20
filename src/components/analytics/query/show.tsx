import { Alert, Button, Container, SimpleGrid, Text } from "@mantine/core"
import { IconAlertCircle } from "@tabler/icons-react"
import { Link, useLocation, useSearchParams } from "react-router"
import type { QueryResult } from "../types"
import { ChartData } from "./chart-data"
import { Rows } from "./rows"
import { Took } from "./took"

export function Show({
  data,
  isFetching,
  refetch,
}: {
  data: QueryResult
  isFetching: boolean
  refetch: () => void
}) {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const newChartSearchParams = new URLSearchParams(searchParams)
  newChartSearchParams.delete("chart")

  const chart = searchParams.get("chart")
  return (
    <div>
      {chart && ["bar", "line", "pie"].includes(chart) && (
        <Container fluid m={40}>
          <p>
            <Link
              to={
                newChartSearchParams.toString()
                  ? `?${newChartSearchParams}`
                  : pathname
              }
            >
              Close chart
            </Link>
          </p>
          <ChartData name="main" data={data} chart={chart} />
        </Container>
      )}
      {data.meta.took_seconds > 1 && (
        <Alert variant="light" color="yellow" icon={<IconAlertCircle />}>
          This query took <Took seconds={data.meta.took_seconds} /> to execute.
        </Alert>
      )}

      <SimpleGrid cols={2}>
        <Text size="sm">
          Rows: {data.meta.count_rows.toLocaleString()}. Took{" "}
          <Took seconds={data.meta.took_seconds} />
          {data.meta.maxed_rows && (
            <span>
              {" "}
              (maxed rows, only showing first{" "}
              {data.meta.count_rows.toLocaleString()})
            </span>
          )}
        </Text>

        <Button
          disabled={isFetching}
          loading={isFetching}
          loaderProps={{ children: "Refreshing" }}
          variant="transparent"
          size="xs"
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </SimpleGrid>

      <Rows data={data.rows} />
    </div>
  )
}
