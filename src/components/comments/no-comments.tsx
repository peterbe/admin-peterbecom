import { Anchor, Box, Text, Title } from "@mantine/core";
import { useLocation, useSearch } from "wouter";

export function NoComments() {
  const [location] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  function subtractQueryString(key: string) {
    const searchParams = new URLSearchParams(searchString);
    searchParams.delete(key);
    let url = location.toString();
    if (searchParams.toString() !== "") {
      url += `?${searchParams.toString()}`;
    }
    return url;
  }

  return (
    <Box p={100}>
      <Title order={2} ta="center">
        No comments
      </Title>

      {searchParams.get("only") && (
        <Text ta="center">
          <Anchor href={subtractQueryString("only")}>Drop the filtering</Anchor>
        </Text>
      )}
      {searchParams.get("search") && (
        <Text ta="center">
          <Anchor href={subtractQueryString("search")}>Drop the search</Anchor>
        </Text>
      )}
    </Box>
  );
}
