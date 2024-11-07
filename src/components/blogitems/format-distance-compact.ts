import {
  type FormatDistanceFnOptions,
  formatDistanceToNowStrict,
} from "date-fns"
import * as locales from "date-fns/locale"

const formatDistanceLocale: Record<string, string> = {
  lessThanXSeconds: "{{count}}s",
  xSeconds: "{{count}}s",
  halfAMinute: "30s",
  lessThanXMinutes: "{{count}}m",
  xMinutes: "{{count}}m",
  aboutXHours: "{{count}}h",
  xHours: "{{count}}h",
  xDays: "{{count}}d",
  aboutXWeeks: "{{count}}w",
  xWeeks: "{{count}}w",
  aboutXMonths: "{{count}}m",
  xMonths: "{{count}}m",
  aboutXYears: "{{count}}y",
  xYears: "{{count}}y",
  overXYears: "{{count}}y",
  almostXYears: "{{count}}y",
} as const

function formatDistance(
  token: string,
  count: number,
  options?: FormatDistanceFnOptions,
) {
  const result =
    token in formatDistanceLocale
      ? formatDistanceLocale[token].replace("{{count}}", `${count}`)
      : token

  if (options?.addSuffix) {
    if (options.comparison !== undefined && options.comparison > 0) {
      return `in ${result}`
    }
    return `${result} ago`
  }

  return result
}

export function formatDistanceCompact(date: string | Date) {
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: {
      ...locales.enUS,
      formatDistance,
    },
  })
}
