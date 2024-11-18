import { Container, Title } from "@mantine/core"
import { Suspense, lazy } from "react"
import type { EditBlogitemT } from "../../types"

const PageviewsInner = lazy(() => import("./pageviews"))

export function Pageviews({ blogitem }: { blogitem: EditBlogitemT }) {
  if (!blogitem._published) return null

  return (
    <Container id="analytics" mt={50}>
      <Title order={3}>Pageviews</Title>
      <Suspense fallback="Loading analytics">
        <PageviewsInner blogitem={blogitem} />
      </Suspense>
    </Container>
  )
}
