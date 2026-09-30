import { Box } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { DisplayError } from "./alerts"
import { ChartContainer } from "./container"
import { Loading } from "./loading"
import { lumpRest } from "./lump-rest"
import { MiniTable } from "./minitable"
import { useSQLQuery } from "./use-query"

const ID = "popular-photos"
export function PopularPhotos() {
  return (
    <ChartContainer id={ID} title="Popular Photos">
      <Inner />
    </ChartContainer>
  )
}

const sqlQuery = () => `

SELECT
    pathname as field, sum(count) AS count
FROM
    analyticsrollupspathnamedaily
WHERE
    created > NOW() - INTERVAL '1 month' AND
    type = 'pageview' AND
    pathname LIKE '/photos/%' AND
    cardinality(string_to_array(pathname, '/')) = 3

GROUP BY 1
ORDER BY 2 DESC
LIMIT 100
`

type Photo = {
  pub_date: string
  oid: string
  title: string
  open_graph_image: string | null
  categories: string[]
  comments: number
  id: number
}
type Photos = {
  groups: {
    date: string
    posts: Photo[]
  }[]
}

function Inner() {
  const sp = new URLSearchParams({ is_photo: "true" })
  const fetchURL = `/api/v1/plog/?${sp}`

  const photos = useQuery<Photos>({
    queryKey: ["popular-photos"],
    queryFn: () => fetch(fetchURL).then((res) => res.json()),
  })
  const mapping = photos.data
    ? Object.fromEntries(
        photos.data.groups
          .flatMap((group) => group.posts)
          .map((photo: Photo) => [photo.oid, photo]),
      )
    : null
  const byPathname = useSQLQuery(sqlQuery(), { prefix: ID })

  return (
    <Box pos="relative" mt={25} mb={50} style={{ minHeight: 260 }}>
      <Loading visible={byPathname.isLoading} />

      {byPathname.data && mapping && (
        <MiniTable
          rows={lumpRest(byPathname.data.rows, 100)}
          fieldTitle="By Pathname"
          note="Last 30 days"
          isFetching={byPathname.isFetching}
          withTotal
          fieldRender={(field) => {
            const oid = (field as string).split(/\//).pop()
            console.log({ field, oid })
            const photo = mapping?.[oid as string]
            if (!photo) return field
            return (
              <>
                <a href={`https://www.peterbe.com/photos/${photo.oid}`}>
                  {photo.title}
                </a>{" "}
                <small>{formatAge(photo.pub_date)}</small>
              </>
            )
          }}
        />
      )}

      <DisplayError error={byPathname.error} />
    </Box>
  )
}

function formatAge(pubDate: string) {
  const date = new Date(pubDate)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 28) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} weeks ago`
  const months = Math.floor(days / 30)
  return `${months} months ago`
}
