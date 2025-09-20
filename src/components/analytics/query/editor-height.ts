export function getEditorHeight(query: string) {
  const lineCount = query.split("\n").length
  const lineHeight = 35 // pixels per line (adjust based on font size)
  const padding = 10 // extra padding
  const height = lineCount * lineHeight + padding
  const minHeight = 100
  const maxHeight = 300
  const editorHeight = Math.min(Math.max(height, minHeight), maxHeight)
  return editorHeight
}
