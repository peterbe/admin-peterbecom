import { Box, SegmentedControl } from "@mantine/core"

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
