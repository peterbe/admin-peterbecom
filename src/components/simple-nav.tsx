import { Avatar, Group, Box } from "@mantine/core";
import { Link } from "wouter";

import { useUserData } from "../hooks/use-userdata";

export function Nav() {
  const { userData } = useUserData();

  return (
    <header>
      <Group justify="space-between">
        <Group>
          ADMIN - <Link href="/">Home</Link> -{" "}
          <Link href="/plog">Blogitems</Link>
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
