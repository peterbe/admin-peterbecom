import { Anchor, Box, Text, Title } from "@mantine/core"
import { Link, useLocation, useSearchParams } from "react-router"

export function NoComments() {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()

  function subtractQueryString(key: string) {
    const sp = new URLSearchParams(searchParams)
    sp.delete(key)
    let url = pathname
    if (sp.toString() !== "") {
      url += `?${sp.toString()}`
    }
    return url
  }

  return (
    <Box p={100}>
      <Title order={2} ta="center">
        No comments
      </Title>

      {searchParams.get("only") && (
        <Text ta="center">
          <Anchor component={Link} to={subtractQueryString("only")}>
            Drop the filtering
          </Anchor>
        </Text>
      )}
      {searchParams.get("search") && (
        <Text ta="center">
          <Anchor component={Link} to={subtractQueryString("search")}>
            Drop the search
          </Anchor>
        </Text>
      )}
    </Box>
  )
}
