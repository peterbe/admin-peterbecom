import { Box, SegmentedControl, Text } from "@mantine/core"

export function RowsOptions({
  value,
  onChange,
  range,
}: {
  value: string
  onChange: (value: string) => void
  range: number[]
}) {
  const options = range.map((x) => {
    return { label: `${x}`, value: `${x}` }
  })
  return (
    <Box>
      <Text span>Rows...</Text>
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
