import { readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const [dir1, dir2] = process.argv.slice(2)
if (dir1 && dir2) main(dir1, dir2)
else console.log("Usage: compare-build-dirs <dir1> <dir2>")

function main(dir1: string, dir2: string) {
  const totalSize1 = getTotalSize(dir1)
  const totalSize2 = getTotalSize(dir2)
  console.log(`Total size of ${dir1}: ${formatSize(totalSize1)}`)
  console.log(`Total size of ${dir2}: ${formatSize(totalSize2)}`)
  const totalDifference = totalSize2 - totalSize1
  console.log(`\n**Difference: ${formatSize(totalDifference)}**\n`)
  if (!totalDifference) {
    return
  }
  const tuples = getTuples(dir1, dir2)
  const notables = tuples.filter(({ before, after }) => before !== after)
  if (notables.length) {
    console.log("Notable changes...")
  }
  for (const { path, before, after, isNew } of notables.sort(
    (a, b) => b.before - a.before,
  )) {
    const sizeDifference = after - before

    console.log(
      ` - \`${path}\`: ${before} (${formatSize(
        before,
      )}) -> ${after} (${formatSize(after)}) (${formatSize(sizeDifference)}) (${
        isNew ? "new" : "changed"
      })`,
    )
  }
}

function getSizes(dir: string) {
  const sizes: { [filepath: string]: number } = {}
  const ents = readdirSync(dir, { withFileTypes: true })
  for (const ent of ents) {
    if (ent.isDirectory()) {
      Object.assign(sizes, getSizes(join(dir, ent.name)))
    } else {
      const filePath = join(dir, ent.name)
      const { size } = statSync(filePath)

      sizes[normalizeName(filePath)] =
        (sizes[normalizeName(filePath)] || 0) + size
    }
  }
  return sizes
}
function getTuples(baseDir: string, otherDir: string) {
  const baseSizes = Object.fromEntries(
    Object.entries(getSizes(baseDir)).map(([path, size]) => [
      relative(baseDir, path),
      size,
    ]),
  )
  const otherSizes = Object.fromEntries(
    Object.entries(getSizes(otherDir)).map(([path, size]) => [
      relative(otherDir, path),
      size,
    ]),
  )
  const tuples: {
    path: string
    before: number
    after: number
    isNew: boolean
  }[] = []
  for (const [path, before] of Object.entries(baseSizes)) {
    const after = otherSizes[path] || 0
    tuples.push({
      path,
      before,
      after,
      isNew: !(path in otherSizes),
    })
  }

  return tuples
}

function normalizeName(name: string) {
  return name.replace(/-[A-Z0-9]{8}\./, ".")
}

function formatSize(originalSize: number) {
  const negative = originalSize < 0
  let size = Math.abs(originalSize)
  const units = ["B", "KB", "MB", "GB"]
  let unitIndex = 0
  while (size > 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${negative ? "-" : ""}${size.toFixed(unitIndex === 0 ? 0 : 2)} ${
    units[unitIndex]
  }`
}

function getTotalSize(dir: string) {
  let totalSize = 0
  const ents = readdirSync(dir, { withFileTypes: true })
  for (const ent of ents) {
    if (ent.isDirectory()) {
      totalSize += getTotalSize(join(dir, ent.name))
    } else {
      const { size } = statSync(join(dir, ent.name))
      totalSize += size
    }
  }
  return totalSize
}
