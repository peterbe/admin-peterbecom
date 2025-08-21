import { Loader, Paper, SimpleGrid, Table, Text } from "@mantine/core"
import type { QueryResultRow } from "../types"
import { formatNumber } from "./number-format"

export function MiniTable({
  rows,
  fieldTitle,
  note,
  isFetching,
  withTotal,
}: {
  rows: QueryResultRow[]
  fieldTitle: string
  note?: string
  isFetching?: boolean
  withTotal?: boolean
}) {
  const totalCount = rows.reduce((sum, row) => sum + (row.count as number), 0)
  return (
    <Paper withBorder p="md" radius="md">
      <Table highlightOnHover withRowBorders={false}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{fieldTitle}</Table.Th>
            <Table.Th colSpan={2} style={{ textAlign: "right" }}>
              Count
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.field}>
              <Table.Td>{row.field}</Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <Text span c="dimmed" size="sm">
                  {(((row.count as number) / totalCount) * 100).toFixed(1)}%
                </Text>{" "}
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {formatNumber(row.count as number)}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        {withTotal && (
          <Table.Tfoot>
            <Table.Tr>
              <Table.Td>TOTAL</Table.Td>
              <Table.Td colSpan={2} style={{ textAlign: "right" }}>
                {formatNumber(totalCount)}
              </Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        )}
      </Table>
      <SimpleGrid cols={2}>
        {note && (
          <Text fz="xs" c="dimmed" mt={7}>
            {note}
          </Text>
        )}
        {isFetching && (
          <Text ta="right">
            <Loader size={12} />
          </Text>
        )}
      </SimpleGrid>
    </Paper>
  )
}
