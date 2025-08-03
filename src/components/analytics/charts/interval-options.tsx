import { Box, SegmentedControl } from "@mantine/core"

export function IntervalOptions({
  value,
  onChange,
  range = [3, 7, 28, 90],
}: {
  value: string
  onChange: (value: string) => void
  range?: number[]
}) {
  const days = range
  const options = days.map((d) => ({ label: `${d} days`, value: `${d}` }))
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
