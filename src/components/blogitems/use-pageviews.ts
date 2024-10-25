import { useQuery } from "@tanstack/react-query";
import type { BlogitemT, QueryResult } from "../../types";
import { fetchAnalyticsQuery } from "../api-utils";
import type { PageviewsByDate, PageviewsByOID } from "./types";

export function useRecentPageviews(blogitems: BlogitemT[]): PageviewsByOID {
  const interval = "month";
  const days = 60;
  const pathnames = blogitems.map((b) => `/plog/${b.oid}`);
  const analytics = useQuery<QueryResult>({
    queryKey: ["recent-pageviews", interval, days, ...pathnames],
    queryFn: async () => {
      if (pathnames.length === 0) {
        return null;
      }
      const pathnamesArray = pathnames.map((p) => `'${p}'`).join(", ");
      return fetchAnalyticsQuery(
        `
    SELECT
        DATE_TRUNC('${interval}', created) AS date,
        data->>'pathname' AS pathname,
        COUNT(*) AS count
    FROM
        analytics
    WHERE
        type = 'pageview'
        AND created > now() - interval '${days} days'
        AND (data->>'pathname') IN (${pathnamesArray})
    GROUP BY
        data->>'pathname',
        date
    ORDER BY
        1 desc
    LIMIT 1000
          `.trim(),
      );
    },
    refetchOnWindowFocus: process.env.NODE_ENV === "development",
  });

  const map = new Map<string, PageviewsByDate[]>();
  for (const b of blogitems) {
    map.set(b.oid, []);
  }
  for (const row of analytics.data?.rows || []) {
    const pathname = row.pathname as string;
    const oid = pathname.replace("/plog/", "");
    const date = row.date as string;
    const count = row.count as number;
    if (map.has(oid)) {
      const existing = map.get(oid) || [];
      existing.push({ date, count });
      map.set(oid, existing);
    } else {
      map.set(oid, [{ date, count }]);
    }
  }

  return map;
}
