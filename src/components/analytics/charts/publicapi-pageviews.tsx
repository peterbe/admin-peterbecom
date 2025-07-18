import { ChartContainer } from "./container"
import { CountByDay } from "./count-by-day"

const ID = "publicapi-pageviews"
export function PublicAPIPageviews() {
  return (
    <ChartContainer id={ID} title="Public API Pageviews">
      <CountByDay id={ID} type="publicapi-pageview" />
    </ChartContainer>
  )
}
