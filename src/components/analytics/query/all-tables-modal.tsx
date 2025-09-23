import { CodeHighlight } from "@mantine/code-highlight"
import {
  ActionIcon,
  Code,
  CopyButton,
  Divider,
  List,
  Modal,
  Tooltip,
} from "@mantine/core"
import { IconCheck, IconCopy } from "@tabler/icons-react"

const KNOWN_TABLES = [
  "analytics",
  "analytics_geo",
  "analyticsrollupsdaily",
  "analyticsrollupspathnamedaily",
  "requestlog",
  "requestlogrollupsbotagentstatuscodedaily",
]

type Props = {
  opened: boolean
  onClose: () => void
}

export function AllTablesModal({ opened, onClose }: Props) {
  const unionSQLQuery = KNOWN_TABLES.map((table) => {
    return `select '${table}' as "table", count(*) from ${table}`
  }).join("\nunion\n")
  return (
    <Modal opened={opened} onClose={onClose} title="All Known Tables" size="lg">
      <List>
        {KNOWN_TABLES.map((table) => (
          <List.Item key={table}>
            <Code>{table}</Code>
            <CopyButton value={table}>
              {({ copied, copy }) => (
                <Tooltip
                  label={copied ? "Copied" : "Copy"}
                  withArrow
                  position="right"
                >
                  <ActionIcon
                    color={copied ? "teal" : "gray"}
                    variant="subtle"
                    onClick={copy}
                  >
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </List.Item>
        ))}
      </List>
      <Divider my="md" />
      <CodeHighlight code={unionSQLQuery} language="sql" radius="md" mb={10} />
    </Modal>
  )
}
