import { Container, Group, Paper, Title } from "@mantine/core"
import type { EditBlogitemT } from "../../types"
import { ArchiveBlogitem } from "./archive-blogitem"
import { DeleteBlogitem } from "./delete-blogitem"
import { BlogitemDisallowComments } from "./disallow-comments-option"
import { BlogitemHideComments } from "./hide-comments-option"

export function DangerZone({ blogitem }: { blogitem: EditBlogitemT }) {
  return (
    <Container>
      <Paper mt={100} mb={100}>
        <Title order={3}>Danger zone</Title>
        <Group>
          <DeleteBlogitem oid={blogitem.oid} />
          {blogitem._published && <ArchiveBlogitem blogitem={blogitem} />}
          <BlogitemHideComments blogitem={blogitem} />
          <BlogitemDisallowComments blogitem={blogitem} />
        </Group>
      </Paper>
    </Container>
  )
}
