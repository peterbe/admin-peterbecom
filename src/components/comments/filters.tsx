import {
  Box,
  Button,
  CloseButton,
  Code,
  Grid,
  Modal,
  SegmentedControl,
  Text,
  TextInput,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconSearch } from "@tabler/icons-react"
import { useState } from "react"
import { useSearchParams } from "react-router"

const CHOICES = [
  { label: "Any", value: "" },
  { label: "Unapproved", value: "unapproved" },
  { label: "Autoapproved", value: "autoapproved" },
]

export function Filters({ disabled }: { disabled: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const only = searchParams.get("only") || ""

  const [search, setSearch] = useState(searchParams.get("search") || "")

  return (
    <Box mb={30} data-testid="comments-filters">
      <Grid>
        <Grid.Col span={{ base: 12, md: 8, lg: 8 }}>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const sp = new URLSearchParams(searchParams)
              if (search.trim()) {
                sp.set("search", search)
              } else {
                sp.delete("search")
              }
              setSearchParams(sp)
            }}
          >
            <TextInput
              placeholder="Search"
              aria-label="Search"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              radius="xl"
              rightSection={
                search ? (
                  <CloseButton
                    aria-label="Clear input"
                    onClick={() => {
                      setSearch("")
                      const sp = new URLSearchParams(searchParams)
                      sp.delete("search")
                      setSearchParams(sp)
                    }}
                  />
                ) : (
                  <IconSearch />
                )
              }
              disabled={disabled}
            />
          </form>
          <SearchTips />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4, lg: 4 }}>
          <SegmentedControl
            value={only}
            onChange={(x) => {
              const sp = new URLSearchParams(searchParams)
              if (x === "unapproved") {
                sp.set("only", "unapproved")
              } else if (x === "autoapproved") {
                sp.set("only", "autoapproved")
              } else if (!x) {
                sp.delete("only")
              } else {
                throw new Error(`Unexpected value: ${x}`)
              }
              setSearchParams(sp)
            }}
            data={CHOICES}
            disabled={disabled}
          />
        </Grid.Col>
      </Grid>
    </Box>
  )
}

function SearchTips() {
  const [opened, { open, close }] = useDisclosure(false)
  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Search tips"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 2,
        }}
      >
        <Text>
          For example:
          <Code>oid:my-oid</Code>
          <br />
          <Code>https://www.peterbe.com/plog/my-oid</Code>
          <br />
          <Code>oid:!my-oid</Code> (anything but that blog item)
          <br />
        </Text>
      </Modal>
      <Button variant="transparent" size="xs" onClick={open}>
        Search tips
      </Button>
    </>
  )
}
