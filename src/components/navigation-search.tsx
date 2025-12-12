import {
  Alert,
  Autocomplete,
  type AutocompleteProps,
  Box,
  Button,
  type ComboboxItem,
  Group,
  type MantineSize,
  type OptionsFilter,
  Text,
} from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useNavigate } from "react-router"
import { blogitemsShowAllQueryKey, fetchShowAllBlogitems } from "./api-utils"

type ShowAllBlogitems = {
  blogitems: {
    id: number
    oid: string
    title: string
  }[]
  count: number
}

const escaped = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")

const optionsFilter: OptionsFilter = ({ options, search }) => {
  const s = search.toLowerCase().trim()
  const rex = s ? new RegExp(`\\b${escaped(s)}`, "i") : null

  const filtered = (options as ComboboxItem[]).filter((option) => {
    if (!rex) return false
    if (!s) return false

    if (option.label.match(rex) || option.value.match(rex)) {
      return true
    }
    return false
  })
  return filtered
}

const renderAutocompleteOption: AutocompleteProps["renderOption"] = (props) => {
  const option = props.option as ComboboxItem
  return (
    <Group gap="sm">
      <div>
        <Text>{option.label}</Text>
        <Text size="sm" opacity={0.5}>
          {option.value}
        </Text>
      </div>
    </Group>
  )
}

export function NavigationSearch({
  w,
  size,
}: {
  w?: number
  size?: MantineSize
}) {
  const navigate = useNavigate()

  const [value, setValue] = useState("")

  const { data, isError, error, isPending, refetch } =
    useQuery<ShowAllBlogitems>({
      queryKey: blogitemsShowAllQueryKey(),
      queryFn: fetchShowAllBlogitems,
      refetchOnWindowFocus: false,
    })

  const items = !data
    ? []
    : data.blogitems.map((blogitem) => ({
        value: blogitem.oid,
        label: blogitem.title,
      }))

  return (
    <Box>
      {error && (
        <Alert color="red" title="Loading error">
          <Text>Failed to load blogitems: {error.message}</Text>
          <Button onClick={() => refetch()}>Refresh</Button>
        </Alert>
      )}
      <Autocomplete
        size={size}
        w={w}
        value={value}
        onChange={setValue}
        placeholder="Search titles or OIDs"
        data={items}
        filter={optionsFilter}
        renderOption={renderAutocompleteOption}
        limit={10}
        onOptionSubmit={(picked) => {
          if (picked) {
            setValue("") // XXX doesn't work
            void navigate(`/plog/${picked}`)
          }
        }}
        disabled={!data || isError || isPending}
        rightSection={<IconSearch />}
        maxDropdownHeight={400}
        comboboxProps={{
          shadow: "md",
          dropdownPadding: 10,

          transitionProps: { transition: "pop", duration: 100 },
        }}
      />
    </Box>
  )
}
