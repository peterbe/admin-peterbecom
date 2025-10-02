import { ActionIcon, Tooltip } from "@mantine/core"
import { IconMapPin } from "@tabler/icons-react"
import type { Comment } from "./types"

export function CommentIPAddress({ comment }: { comment: Comment }) {
  if (!comment.ip_address) return null

  return (
    <Tooltip label={`IP Address ${comment.ip_address}`}>
      <ActionIcon variant="default" aria-label="IP Address">
        <IconMapPin style={{ width: "70%", height: "70%" }} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  )
}
