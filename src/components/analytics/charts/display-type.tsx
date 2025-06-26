import { SegmentedControl } from "@mantine/core"
import { useDisplayType } from "./use-display-type"

type DisplayTypes = "table" | "pie" | "line"
export function DisplayType({
  id,
  choices,
}: {
  id: string
  choices: DisplayTypes[]
}) {
  const [value, setDisplayType] = useDisplayType(id, choices[0])

  const options = choices.map((value) => {
    return { label: title(value), value }
  })

  return (
    <SegmentedControl value={value} onChange={setDisplayType} data={options} />
  )
}

function title(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
