import { Avatar, Box, Group } from "@mantine/core";

import { useCountUnapprovedComments } from "../hooks/use-count-unapproved-comments";
import { useUserData } from "../hooks/use-userdata";
import { SmartAnchor } from "./smart-anchor";

export function Nav() {
  const { userData } = useUserData();

  const { data: countUnapprovedComments } = useCountUnapprovedComments();

  return (
    <header>
      <Group justify="space-between">
        <Group>
          <SmartAnchor href="/">Home</SmartAnchor>
          <SmartAnchor href="/plog">Blogitems</SmartAnchor>
          <SmartAnchor href="/plog/add">Add blogitem</SmartAnchor>
          <SmartAnchor href="/plog/comments">Comments</SmartAnchor>
          {countUnapprovedComments && (
            <SmartAnchor href="/plog/comments?only=unapproved">
              ({countUnapprovedComments.count}) Unapproved Comments
            </SmartAnchor>
          )}
        </Group>

        <Group>
          <Box mt={20} mr={10}>
            {userData?.user?.picture_url && (
              <Avatar
                style={{ textAlign: "right" }}
                size="md"
                src={userData.user.picture_url}
                alt={userData?.user.email || userData?.user.username}
              />
            )}
          </Box>
        </Group>
      </Group>
    </header>
  );
}
