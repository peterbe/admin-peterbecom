import { Box } from "@mantine/core"
import { useSearchParams } from "react-router"
import { Lookup } from "./lookup"
import { Search } from "./search"

export function Probe() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get("search") || ""

  const disabled = false

  return (
    <Box>
      <Search disabled={disabled} />
      {search && <Lookup search={search} />}
    </Box>
  )
}
