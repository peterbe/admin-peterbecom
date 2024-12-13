export function urlFilterToSQL(urlFilter: string) {
  if (!urlFilter) {
    return ""
  }
  if (urlFilter === "lyrics-post") {
    return `
    AND (
      data->>'pathname' LIKE '/plog/blogitem-040601-1/p%' OR
      data->>'pathname' = '/plog/blogitem-040601-1'
    )
      `.trim()
  }
  if (urlFilter === "lyrics-search") {
    return `
    AND data->>'pathname' LIKE '/plog/blogitem-040601-1/q/%'
      `.trim()
  }
  if (urlFilter === "lyrics-song") {
    return `
    AND data->>'pathname' LIKE '/plog/blogitem-040601-1/song/%'
      `.trim()
  }
  if (urlFilter === "not-lyrics") {
    return `
    AND data->>'pathname' NOT LIKE '/plog/blogitem-040601-1%'
      `.trim()
  }

  throw new Error(`Unknown urlFilter: ${urlFilter}`)
}
