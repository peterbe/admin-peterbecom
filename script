async function main(args) {
  const url = args[0] || "http://localhost:3000"
  console.time(`Download ${url}`)
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  const text = await response.text()
  console.timeEnd(`Download ${url}`)

  let found = false
  for (const tag of text.matchAll(/<link (.+?)>/g)) {
    if (tag[1].includes('rel="manifest"')) {
      const manifestUrl = new URL(tag[1].match(/href="(.+?)"/)[1], url)
      await checkManifest(manifestUrl)
      found = true
    }
  }
  if (!found) throw new Error("No manifest found")

  console.log("All good!")
}

async function checkManifest(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }
  const text = await response.text()
  const manifest = JSON.parse(text)

  console.time(`Checking ${url}`)
  await Promise.all(
    manifest.icons.map(async (icon) => {
      const iconUrl = new URL(icon.src, url)
      await checkIcon(iconUrl, icon.type)
    }),
  )
  console.timeEnd(`Checking ${url}`)
}

async function checkIcon(url, type) {
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
