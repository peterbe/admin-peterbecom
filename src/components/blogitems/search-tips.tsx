import { Code, Table, Text } from "@mantine/core";

type Props = {
  append: (s: string) => void;
};
export function SearchTips({ append }: Props) {
  const tips = [
    ["has:summary", "Exclusively those that have a non-empty summary"],
    ["no:summary", "Exclusively those that have no summary"],
    ["has:split", "Those that contain a <!--split-->"],
    ["no:split", "Those that have no <!--split-->"],
    ["is:archived", "Those that are archived"],
    ["is:future", "Those whose publish date is in the future"],
    ["is:published", "Those whose publish date is in the past"],
    ["is:unpublished", "Those whose publish date is in the future"],
    ["cat:foo", "Those that belong to category 'foo'"],
    ["category:foo", "Those that belong to category 'foo'"],
  ];
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
                <Code onClick={() => append(search)}>{search}</Code>
              </Table.Th>
              <Table.Td>
                <Text>{explanation}</Text>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
