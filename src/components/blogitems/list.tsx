import { Alert, Box } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router"
import { API_BASE } from "../../config"
import type { BlogitemsServerData } from "../../types"
import { ListTable } from "./list-table"
import { PaginationSize } from "./pagination-size"
import { useRecentPageviews } from "./use-pageviews"

const DEFAULT_SIZE = "10"

export function List() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [paginationSize, setPaginationSize] = useLocalStorage<string>({
    key: "pagination-size",
    defaultValue: DEFAULT_SIZE,
  })
  const search = searchParams.get("search") || ""
  const orderBy = searchParams.get("orderBy") || "modify_date"

  const sp = new URLSearchParams({
    search,
    order: orderBy,
    batch_size: `${paginationSize}`,
  })
  const apiUrl = `${API_BASE}/plog/?${sp}`

  const { data, error, isPending } = useQuery<BlogitemsServerData>({
    queryKey: ["blogitems", apiUrl],
    queryFn: async () => {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return await response.json()
    },
  })

  const blogitems = data?.blogitems || []
  const pageviews = useRecentPageviews(blogitems)

  return (
    <Box>
      {error && (
        <Alert color="red">Failed to load blogitems: {error.message}</Alert>
      )}

      <ListTable
        isPending={isPending}
        data={data}
        orderBy={orderBy}
        search={search}
        updateSearch={(s: string) => {
          const sp = new URLSearchParams(searchParams)
          const existing = sp.get("search")
          if (s.trim() && s !== existing) {
            sp.set("search", s)
          } else {
            sp.delete("search")
          }
          setSearchParams(sp)
        }}
        pageviews={pageviews}
      />

      <PaginationSize
        value={paginationSize}
        setValue={setPaginationSize}
        disabled={!data || data.blogitems.length === 0}
      />
    </Box>
  )
}
