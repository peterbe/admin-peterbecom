export type BannedUrlPattern = {
  id: number
  pattern: string
  is_regex: boolean
  case_insensitive: boolean
  kills: number
  created: string
  modified: string
}
