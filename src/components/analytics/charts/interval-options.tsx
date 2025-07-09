import { Box, SegmentedControl, Text } from "@mantine/core"

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
  // if (new Date(2024, 9, 0) < new Date()) {
  //   days.push(90)
  // }
  const options = days.map((d) => ({ label: `${d} days`, value: `${d}` }))
  return (
    <Box>
      <Text span>Last...</Text>
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
