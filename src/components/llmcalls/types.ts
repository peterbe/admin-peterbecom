export type Call = {
  id: number
  status: string
  use_case: string
  model: string
  took_seconds: number
  created: string
  messages: object[]
  response: object
  metadata: object
  error: object | null
}

export type ServerData = {
  calls: Call[]
  count: number
  aggregates: {
    status: Record<string, number>
    use_case: Record<string, number>
    model: Record<string, number>
  }
}
