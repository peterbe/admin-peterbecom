import { HttpResponse } from "msw";

import type { QueryResult, QueryResultRow } from "../../types";

function getQueryResult(query: string): QueryResult {
  const rows: QueryResultRow[] = [];

  // The `hello-world` or `hello-new-world` is too new.
  if (!query.includes("= '/plog/hello-")) {
    const now = new Date();
    for (let i = 10; i > 0; i--) {
      rows.push({
        date: now.toISOString(),
        count: Math.floor(Math.random() * 100),
      });
      now.setDate(now.getDate() - 7);
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
  };

  return queryResult;
}

export const ANALYTICS = (params: URLSearchParams) => {
  const query = params.get("query");
  if (!query) {
    return new HttpResponse(null, {
      status: 400,
      statusText: "Missing 'query'",
    });
  }
  return HttpResponse.json(getQueryResult(query));
};
