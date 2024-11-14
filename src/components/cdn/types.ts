type HTTPLookup = {
  took: number
  status_code: number
  x_cache: string
  headers: {
    [key: string]: string
  }
}

export type ProbeServerData = {
  absolute_url: string
  http_1: HTTPLookup
  other_pages?: string[]
}
