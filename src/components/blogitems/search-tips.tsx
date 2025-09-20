import { Code, Table, Text } from "@mantine/core"

type Props = {
  append: (s: string) => void
}
export function SearchTips({ append }: Props) {
  const tips = [
    ["has:summary", "Exclusively those that have a non-empty summary"],
    ["no:summary", "Exclusively those that have no summary"],
    ["is:archived", "Those that are archived"],
    ["is:future", "Those whose publish date is in the future"],
    ["not:future", "Those whose publish date is not in the future"],
    ["is:published", "Those whose publish date is in the past"],
    ["not:published", "Those whose publish date is in the future"],
    ["cat:foo", "Those that belong to category 'Foo'"],
    [
      'category:"web performance"',
      "Those that belong to category 'Web Performance'",
    ],
  ]
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Search</Table.Th>
          <Table.Th>Explanation</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {tips.map(([search, explanation]) => {
          return (
            <Table.Tr key={search}>
              <Table.Th>
                <Code
                  onClick={() => {
                    if (search !== undefined) append(search)
                  }}
                >
                  {search}
                </Code>
              </Table.Th>
              <Table.Td>
                <Text>{explanation}</Text>
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}
