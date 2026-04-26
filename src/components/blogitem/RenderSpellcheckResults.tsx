import {
  Alert,
  Blockquote,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Text,
} from "@mantine/core"
import { diffChars, diffSentences } from "diff"
import { useState } from "react"
import { Took } from "../utils/took"
import type { SpellcheckResponse } from "./useSpellcheck"

export function RenderSpellcheckResult({
  data,
  onReplace,
  onSelect,
}: {
  data: SpellcheckResponse
  onReplace: (before: string, after: string) => boolean | undefined
  onSelect: (before: string) => void
}) {
  const [showBeforeAfter, setShowBeforeAfter] = useState<string[]>([])
  const [replaced, setReplaced] = useState<string[]>([])
  const [diffStrategies, setDiffStrategies] = useState<{
    [key: string]: "sentences" | "chars"
  }>({})
  return (
    <div>
      {data.spellcheck.length === 0 && <Alert>No spelling errors found.</Alert>}
      {data.spellcheck.map((result) => {
        if (replaced.includes(result.before)) {
          return null
        }
        if (result.error) {
          return (
            <Alert key={result.before} color="red">
              Error checking spelling for "{result.before}"
            </Alert>
          )
        }

        return (
          <Paper key={result.before} shadow="xs" p="md" withBorder mb={20}>
            <Blockquote color="cyan" mb={10}>
              {diffStrategies[result.before] === "sentences" ? (
                <DiffSentences oldStr={result.before} newStr={result.after} />
              ) : (
                <DiffChars oldStr={result.before} newStr={result.after} />
              )}
            </Blockquote>
            <Group mb={10}>
              <Button
                onClick={() => {
                  if (onReplace(result.before, result.after)) {
                    setReplaced((prev) => [...prev, result.before])
                  }
                }}
                color="green"
                size="xs"
              >
                Replace
              </Button>
              <Button
                onClick={() => onSelect(result.before)}
                color="blue"
                variant="light"
                size="xs"
              >
                Highlight
              </Button>
              <Button
                onClick={() =>
                  setShowBeforeAfter((prev) =>
                    prev.includes(result.before)
                      ? prev.filter((b) => b !== result.before)
                      : [...prev, result.before],
                  )
                }
                color="blue"
                variant="light"
                size="xs"
              >
                {showBeforeAfter.includes(result.before) ? "Hide" : "Show"}{" "}
                Before/After
              </Button>
              <Button
                onClick={() =>
                  setDiffStrategies((prev) =>
                    prev[result.before] === "sentences"
                      ? { ...prev, [result.before]: "chars" }
                      : { ...prev, [result.before]: "sentences" },
                  )
                }
                color="blue"
                variant="light"
                size="xs"
              >
                {diffStrategies[result.before] === "sentences"
                  ? "Diff chars"
                  : "Diff sentences"}
              </Button>
            </Group>

            {showBeforeAfter.includes(result.before) && (
              <SimpleGrid cols={2}>
                <Blockquote color="yellow" cite="before" mb={10}>
                  <Text>{result.before}</Text>
                </Blockquote>

                <Blockquote color="blue" cite="after" mb={10}>
                  <Text>{result.after}</Text>
                </Blockquote>
              </SimpleGrid>
            )}
          </Paper>
        )
      })}
      <Text size="sm">
        <Took seconds={data.metadata.took_seconds} />
      </Text>
    </div>
  )
}

function DiffSentences({ oldStr, newStr }: { oldStr: string; newStr: string }) {
  const d = diffSentences(oldStr, newStr)
  return d.map((part) => {
    const color = part.added ? "#c7f4c7" : part.removed ? "#ffd9df" : undefined
    return (
      <span
        key={`${part.value}-${part.added}-${part.removed}`}
        style={{ backgroundColor: color }}
      >
        {part.value}
      </span>
    )
  })
}
function DiffChars({ oldStr, newStr }: { oldStr: string; newStr: string }) {
  const d = diffChars(oldStr, newStr)
  return d.map((part) => {
    const color = part.added ? "#c7f4c7" : part.removed ? "#ffd9df" : undefined
    return (
      <span
        key={`${part.value}-${part.added}-${part.removed}`}
        style={{ backgroundColor: color }}
      >
        {part.value}
      </span>
    )
  })
}

// function LinesHtml({ text }: { text: string }) {
//   return text.split("\n").map((line, i, arr) => {
//     return (
//       <Fragment key={`${line}${i}`}>
//         <span
//           dangerouslySetInnerHTML={{
//             __html: line,
//           }}
//         />
//         {i < arr.length - 1 && <br />}
//       </Fragment>
//     )
//   })
// }
