import { Alert, Box } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { API_BASE } from "../../config"
import type { BlogitemsServerData } from "../../types"
import { ListTable } from "./list-table"
import { PaginationSize } from "./pagination-size"

// import { useRecentPageviews } from "./use-pageviews"

const DEFAULT_SIZE = "10"

export function List() {
  // const [searchParams, setSearchParams] = useSearchParams()
  const [paginationSize, setPaginationSize] = useLocalStorage<string>({
    key: "pagination-size",
    defaultValue: DEFAULT_SIZE,
  })
  // const search = searchParams.get("search") || ""
  // const orderBy = searchParams.get("orderBy") || "modify_date"
  const [since, setSince] = useState("")

  const { data, error, isPending } = useQuery<BlogitemsServerData>({
    queryKey: ["blogitems-all"],
    queryFn: async () => {
      const apiUrl = `${API_BASE}/plog/all/`
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return await response.json()
    },
  })

  useEffect(() => {
    if (data?.blogitems && data.blogitems.length > 0) {
      // console.log(
      //   "MOST RECENT MODIFIED",
      //   data.blogitems
      //     .map((b) => b.modify_date)
      //     .sort()
      //     .reverse()[0],
      // )
      setSince(
        data.blogitems
          .map((b) => b.modify_date)
          .sort()
          .reverse()[0],
      )
    }
  }, [data?.blogitems])

  const updater = useQuery<BlogitemsServerData>({
    queryKey: ["blogitems-updater", "updater", since],
    queryFn: async () => {
      // console.log("UPDATER", { since })
      const sp = new URLSearchParams({ since })
      const apiUrl = `${API_BASE}/plog/all/?${sp}`

      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return await response.json()
    },
    refetchInterval: 10_000,
    enabled: !!since,
    refetchOnWindowFocus: true,
  })

  const queryClient = useQueryClient()

  useEffect(() => {
    if (!updater.data || !updater.data.count) return
    // console.log("UPDATER DATA", updater.data)
    const byId = new Map(updater.data.blogitems.map((b) => [b.id, b]))
    queryClient.setQueryData(
      ["blogitems-all"],
      (oldData: BlogitemsServerData | undefined) => {
        if (!oldData) return undefined

        const newData: BlogitemsServerData = {
          blogitems: [],
          count: 0,
        }
        for (const blogitem of oldData.blogitems) {
          const newBlogitem = byId.get(blogitem.id)
          if (newBlogitem) {
            console.log("UPDATING BLOGITEM", newBlogitem)
            newData.blogitems.push(newBlogitem)
            byId.delete(blogitem.id)
          } else {
            console.log("ADDING BLOGITEM", newBlogitem)
            newData.blogitems.push(blogitem)
          }
        }
        for (const blogitem of byId.values()) {
          newData.blogitems.push(blogitem)
        }
        newData.count = newData.blogitems.length
        return newData
      },
    )
  }, [updater.data, queryClient.setQueryData])

  // const blogitems = data?.blogitems || []
  // const pageviews = useRecentPageviews(blogitems)

  return (
    <Box>
      {error && (
        <Alert color="red">Failed to load blogitems: {error.message}</Alert>
      )}

      <ListTable
        isPending={isPending}
        data={data}
        paginationSize={Number(paginationSize)}
        // orderBy={orderBy}
        // search={search}
        // updateSearch={(s: string) => {
        //   const sp = new URLSearchParams(searchParams)
        //   const existing = sp.get("search")
        //   if (s.trim() && s !== existing) {
        //     sp.set("search", s)
        //   } else {
        //     sp.delete("search")
        //   }
        //   setSearchParams(sp)
        // }}
        // pageviews={pageviews}
      />

      <PaginationSize
        value={paginationSize}
        setValue={setPaginationSize}
        disabled={!data || data.blogitems.length === 0}
      />
    </Box>
  )
}
