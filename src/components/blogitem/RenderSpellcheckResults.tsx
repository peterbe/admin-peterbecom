import { Alert, Blockquote, Button, Divider, Paper, Text } from "@mantine/core"
import { Fragment } from "react"
import { Took } from "../analytics/query/took"
import type { SpellcheckResponse } from "./useSpellcheck"

export function RenderSpellcheckResult({
  data,
  onReplace,
}: {
  data: SpellcheckResponse
  onReplace: (before: string, after: string) => void
}) {
  return (
    <div>
      {data.spellcheck.length === 0 && <Alert>No spelling errors found.</Alert>}
      {data.spellcheck.map((result) => {
        if (result.error) {
          return (
            <Alert key={result.before} color="red">
              Error checking spelling for "{result.before}"
            </Alert>
          )
        }
        return (
          <Paper key={result.before} shadow="xs" p="md" withBorder mb={20}>
            <Text size="xs" fs="italic">
              before:
            </Text>
            <Text>{result.before}</Text>

            <Divider my="md" />
            <Text size="xs" fs="italic">
              after:
            </Text>
            <Text>{result.after}</Text>

            {result.html_diff && (
              <>
                <Divider my="md" />
                <Text size="xs" fs="italic">
                  diff:
                </Text>
                <Blockquote color="cyan" cite="Diff" mb={10}>
                  <LinesHtml text={result.html_diff.trim()} />
                </Blockquote>
              </>
            )}

            <Divider my="md" />
            <Button onClick={() => onReplace(result.before, result.after)}>
              Replace
            </Button>
          </Paper>
        )
      })}
      <Text size="sm">
        <Took seconds={data.metadata.took_seconds} />
      </Text>
    </div>
  )
}

function LinesHtml({ text }: { text: string }) {
  return text.split("\n").map((line, i, arr) => {
    return (
      <Fragment key={`${line}${i}`}>
        <span
          dangerouslySetInnerHTML={{
            __html: line,
          }}
        />
        {i < arr.length - 1 && <br />}
      </Fragment>
    )
  })
}
