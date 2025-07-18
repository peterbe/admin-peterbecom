import { ChartContainer } from "./container"
import { CountByDay } from "./count-by-day"

const ID = "pageviews"
export function Pageviews() {
  return (
    <ChartContainer id={ID} title="Pageviews">
      <CountByDay id={ID} type="pageview" />
    </ChartContainer>
  )
}
