export function isAllCaps(text: string) {
  if (text === text.toUpperCase()) return true
  if (text.length < 10) return false

  const countUpper = (text.match(/[A-Z]/g) || []).length
  const countLower = (text.match(/[a-z]/g) || []).length
  const ratio = countUpper / (countUpper + countLower)
  if (ratio > 0.65) return true

  return false
}

export function fixAllCaps(text: string) {
  return text
    .toLowerCase()
    .replace(/\bi\b/g, "I")
    .replace(/\.\s[a-z]/g, (m) => m.toUpperCase())
    .replace(/^[a-z]/g, (m) => m.toUpperCase())
}

const assert = (condition: boolean) => {
  if (!condition) throw new Error("Assertion failed")
}

assert(isAllCaps("CAPS"))
assert(!isAllCaps("CAPs"))
assert(isAllCaps("THIS IS ALL CAPS"))
assert(!isAllCaps("This is not all caps"))
assert(isAllCaps("THIS IS ALL caps"))

assert(
  fixAllCaps("THIS IS ALL I CAPS. i am shouting.") ===
    "This is all I caps. I am shouting.",
)
