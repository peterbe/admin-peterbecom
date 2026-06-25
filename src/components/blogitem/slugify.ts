export function slugify(s: string) {
  return s
    .trim()
    .replace(/[#\s]+/g, "-")
    .replace(/[@/'?<>!]/g, "")
    .replaceAll("%", "")
    .replaceAll(",", "")
    .toLowerCase()
}
