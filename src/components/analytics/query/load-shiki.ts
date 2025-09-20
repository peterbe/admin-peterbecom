import { createShikiAdapter } from "@mantine/code-highlight"

async function loadShiki() {
  const { createHighlighter } = await import("shiki")
  const shiki = await createHighlighter({
    langs: ["sql"],
    themes: [],
  })

  return shiki
}

export const shikiAdapter = createShikiAdapter(loadShiki)
