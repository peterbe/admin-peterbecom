import { Box, Grid, SegmentedControl, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useLocation, useSearch } from "wouter";

const CHOICES = [
  { label: "Any", value: "" },
  { label: "Unapproved", value: "unapproved" },
  { label: "Autoapproved", value: "autoapproved" },
];

export function Filters({ disabled }: { disabled: boolean }) {
  const [location, navigate] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const only = searchParams.get("only") || "";

  const [search, setSearch] = useState(searchParams.get("search") || "");

  return (
    <Box>
      <Grid>
        <Grid.Col span={{ base: 12, md: 8, lg: 8 }}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const sp = new URLSearchParams(searchString);
              if (search.trim()) {
                sp.set("search", search);
              } else {
                sp.delete("search");
              }
              navigate(sp.toString() ? `?${sp.toString()}` : location);
            }}
          >
            <TextInput
              placeholder="Search"
              aria-label="Search"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              radius="xl"
              rightSection={<IconSearch />}
              disabled={disabled}
            />
          </form>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4, lg: 4 }}>
          <SegmentedControl
            value={only}
            onChange={(x) => {
              const sp = new URLSearchParams(searchString);
              if (x === "unapproved") {
                sp.set("only", "unapproved");
              } else if (x === "autoapproved") {
                sp.set("only", "autoapproved");
              } else if (!x) {
                sp.delete("only");
              } else {
                throw new Error(`Unexpected value: ${x}`);
              }
              navigate(sp.toString() ? `?${sp.toString()}` : location);
            }}
            data={CHOICES}
            disabled={disabled}
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
}
