import { useMutation } from "@tanstack/react-query"
import { API_BASE } from "../../config"
import type { EditBlogitemT } from "../../types"

type SpellcheckResult = {
  index: number
  before: string
  after: string
  total_time: number
  error: boolean | null
}

export type SpellcheckResponse = {
  spellcheck: SpellcheckResult[]
  errors: string[]
  metadata: {
    took_seconds: number
  }
}
export function useSpellcheck(blogitem: EditBlogitemT) {
  return useMutation<SpellcheckResponse, Error, string>({
    mutationKey: ["spellcheck", blogitem.oid],
    mutationFn: async (markdown: string) => {
      const url = `${API_BASE}/plog/${blogitem.oid}/spellcheck`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markdown }),
      })
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
  })
}
