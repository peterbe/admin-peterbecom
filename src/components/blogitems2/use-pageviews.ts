import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import type { BlogitemT, QueryResult } from "../../types"
import { fetchAnalyticsQuery } from "../api-utils"
import type { PageviewsByDate } from "./types"

export function useRecentPageviews(
  blogitems: BlogitemT[],
): Map<string, PageviewsByDate[]> {
  const [cache, setCache] = useState<Map<string, PageviewsByDate[]>>(
    () => new Map(),
  )
  const interval = "month"
  const days = 60
  const oids = blogitems
    .map((b) => b.oid)
    .filter((oid) => {
      return !cache.has(oid)
    })
  const pathnames = oids.map((oid) => `/plog/${oid}`)
  const analytics = useQuery<QueryResult>({
    queryKey: ["recent-pageviews", interval, days, ...pathnames],
    queryFn: async () => {
      if (pathnames.length === 0) {
        return null
      }
      const pathnamesArray = pathnames
        .map((p) => `'${p.replaceAll("'", "''")}'`)
        .join(", ")
      return fetchAnalyticsQuery(
        `
      SELECT
          DATE_TRUNC('${interval}', day) AS date,
          pathname,
          SUM(count) AS count
      FROM
          analyticsrollupspathnamedaily
      WHERE
          type = 'pageview'
          AND day > now() - interval '${days} days'
          AND pathname IN (${pathnamesArray})
      GROUP BY
          pathname,
          date
      ORDER BY 1 DESC
          `.trim(),
      )
    },
    refetchOnWindowFocus: process.env.NODE_ENV === "development",
  })

  useEffect(() => {
    const acc = new Map<string, PageviewsByDate[]>()
    for (const row of analytics.data?.rows || []) {
      const pathname = row.pathname as string
      const oid = pathname.replace("/plog/", "")
      const date = row.date as string
      const count = row.count as number
      const existing = acc.get(oid) || []
      existing.push({ date, count })
      acc.set(oid, existing)
    }

    setCache((map) => {
      const copy = new Map(map)
      for (const [oid, value] of acc) {
        copy.set(oid, value)
      }
      return copy
    })
  }, [analytics.data])

  return cache
}
