export async function fetcher(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    if (response.status === 400) {
      const json = await response.json()
      if (json.error) {
        throw new Error(json.error)
      }
    }
    throw new Error(`${response.status} on ${response.url}`)
  }
  return response.json()
}

export const refreshingFetchOptions = {
  refetchInterval: 5 * 60 * 1000,
}

export const notRefreshingFetchOptions = {
  refetchOnWindowFocus: false,
  refetchInterval: 15 * 60 * 1000 + Math.random() * 1000,
}
export const apiPrefix = "/api/v0/analytics/query?"
