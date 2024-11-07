import { HttpResponse } from "msw"

import type { QueryResult, QueryResultRow } from "../../types"

function getQueryResult(query: string): QueryResult {
  const rows: QueryResultRow[] = []

  console.log("QUERY:", query)

  // Example for a single
  // SELECT
  //   DATE_TRUNC('day', created) AS date,
  //   COUNT(*) AS count
  // FROM
  //   analytics
  // WHERE
  //   type = 'pageview'
  //   AND created > now() - interval '10 days'
  //   AND (data->>'pathname') = '/plog/test'
  // GROUP BY
  //   date
  // ORDER BY
  //   1 desc
  // LIMIT 100

  // Example for multiple pathnames
  // SELECT
  //   DATE_TRUNC('month', created) AS date,
  //   data->>'pathname' AS pathname,
  //   COUNT(*) AS count
  // FROM
  //   analytics
  // WHERE
  //   type = 'pageview'
  //   AND created > now() - interval '60 days'
  //   AND (data->>'pathname') IN ('/plog/test')
  // GROUP BY
  //   data->>'pathname',
  //   date
  // ORDER BY
  //   1 desc
  // LIMIT 1000

  if (query.includes(`(data->>'pathname') IN (`)) {
    const rex = /\(data->>'pathname'\) IN \((.*)\)/
    const pathnames: string[] = []
    const matched = query.match(rex)
    if (matched) {
      pathnames.push(
        ...matched[1].split(",").map((p) => p.replace(/'/g, "").trim()),
      )
    }
    const now = new Date()
    for (const pathname of pathnames) {
      for (let i = 2; i > 0; i--) {
        rows.push({
          date: now.toISOString(),
          pathname,
          count: Math.floor(Math.random() * 100),
        })
        now.setDate(now.getDate() - 30)
      }
    }
  }
  // The `hello-world` or `hello-new-world` is too new.
  else if (!query.includes("= '/plog/hello-")) {
    const now = new Date()
    for (let i = 10; i > 0; i--) {
      rows.push({
        date: now.toISOString(),
        count: Math.floor(Math.random() * 100),
      })
      now.setDate(now.getDate() - 7)
    }
  }

  const queryResult: QueryResult = {
    rows,
    meta: {
      took_seconds: Math.random(),
      count_rows: rows.length,
      maxed_rows: false,
    },
    error: null,
  }

  return queryResult
}

export const ANALYTICS = (params: URLSearchParams) => {
  const query = params.get("query")
  if (!query) {
    return new HttpResponse(null, {
      status: 400,
      statusText: "Missing 'query'",
    })
  }
  return HttpResponse.json(getQueryResult(query))
}
