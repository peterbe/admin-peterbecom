async function main(args: string[]) {
  const url = args[0] || "http://localhost:3000"
  console.time(`Download ${url}`)
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  const text = await response.text()
  console.timeEnd(`Download ${url}`)

  let found = false
  for (const tag of text.matchAll(/<link (.+?)>/g)) {
    const first = tag[1] as string
    if (first.includes('rel="manifest"')) {
      const matched = first.match(/href="(.+?)"/)
      if (!matched || !matched[1]) throw new Error("No href in manifest link")
      const manifestUrl = new URL(matched[1], url)
      await checkManifest(manifestUrl)
      found = true
    }
  }
  if (!found) throw new Error("No manifest found")

  console.log("All good!")
}

type Manifest = {
  icons: { src: string; sizes: string; type: string }[]
}
async function checkManifest(url: URL) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }
  const text = await response.text()
  const manifest = JSON.parse(text)
  if (!manifest.icons) {
    throw new Error(`No icons in manifest at ${url}`)
  }
  const manifestTyped = manifest as Manifest

  console.time(`Checking ${url}`)
  await Promise.all(
    manifestTyped.icons.map(async (icon) => {
      const iconUrl = new URL(icon.src, url)
      await checkIcon(iconUrl, icon.type)
    }),
  )
  console.timeEnd(`Checking ${url}`)
}

async function checkIcon(url: URL, type: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }
  const ctType = response.headers.get("content-type")
  if (type !== ctType) {
    throw new Error(`For ${url}, expected ${type}, got ${ctType}`)
  }
}

await main(process.argv.slice(2))
process.exit(0)
