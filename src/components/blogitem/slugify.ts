export function slugify(s: string) {
  return s
    .trim()
    .replace(/[#\s]+/g, "-")
    .replace(/[@/'?<>!]/g, "")
    .replaceAll("%", "")
    .replaceAll(",", "")
    .replace(/[^\x00-\x7F]/g, "_")
    .toLowerCase()
}
