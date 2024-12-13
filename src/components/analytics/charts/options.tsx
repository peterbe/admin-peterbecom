import { Box, SegmentedControl, Text } from "@mantine/core"

const DEFAULT_URLFILTER_VALUES = {
  "": "Any page",
  "lyrics-post": "Lyrics post",
  "lyrics-search": "Lyrics searches",
  "lyrics-song": "Lyrics songs",
  "not-lyrics": "Not lyrics",
}
export function UrlFilterOptions({
  value,
  onChange,
  values = DEFAULT_URLFILTER_VALUES,
}: {
  value: string
  onChange: (value: string) => void
  values?: Record<string, string>
}) {
  const options = Object.entries(values).map(([value, label]) => ({
    label,
    value,
  }))
  return (
    <Box>
      <Text span>Filter...</Text>
      <SegmentedControl
        value={value}
        onChange={onChange}
        withItemsBorders={false}
        transitionDuration={300}
        transitionTimingFunction="linear"
        data={options}
      />
    </Box>
  )
}
