import { Avatar, Box, Group } from "@mantine/core";

import { useUserData } from "../hooks/use-userdata";
import { SmartAnchor } from "./smart-anchor";

export function Nav() {
  const { userData } = useUserData();

  return (
    <header>
      <Group justify="space-between">
        <Group>
          ADMIN - <SmartAnchor href="/">Home</SmartAnchor> -{" "}
          <SmartAnchor href="/plog">Blogitems</SmartAnchor> -{" "}
          <SmartAnchor href="/plog/add">Add blogitem</SmartAnchor>
        </Group>

        <Group>
          <Box mt={20} mr={10}>
            {userData?.user?.picture_url && (
              <Avatar
                //   radius="sm"
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
