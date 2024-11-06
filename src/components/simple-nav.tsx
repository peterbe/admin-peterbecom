import { Avatar, Box, Burger, Divider, Drawer, Group } from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";
import { IconHome } from "@tabler/icons-react";
import { useLoaderData } from "react-router-dom";
import type { RootLoaderData } from "../loaders/root";
import { useUserData } from "../whoami/use-userdata";
import { NavigationSearch } from "./navigation-search";
import { SmartAnchor } from "./smart-anchor";

export function Nav() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const { userData } = useUserData();

  if (!userData?.user) {
    return null;
  }
  return (
    <Box pb={100}>
      <header>
        <Group justify="space-between">
          <Group hiddenFrom="sm" pt={10}>
            <SmartAnchor href="/">
              <IconHome />
            </SmartAnchor>
          </Group>
          <Group visibleFrom="sm">
            <Links />
          </Group>
          <Group visibleFrom="sm">
            <NavigationSearch w={400} />
          </Group>

          <Group>
            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              hiddenFrom="sm"
              mt={10}
            />
            <Box mt={20} mr={10} visibleFrom="sm">
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
      <Drawer opened={drawerOpened} onClose={closeDrawer} title="Navigation">
        <Divider my="sm" />
        <Group>
          <Links />
        </Group>
        <Divider my="sm" />

        <NavigationSearch w={400} />

        <Divider my="sm" />
        <Group justify="center" grow pb="xl" px="md">
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
      </Drawer>
    </Box>
  );
}

function Links() {
  const { countUnapprovedComments } = useLoaderData() as RootLoaderData;

  return (
    <>
      <SmartAnchor href="/">Home</SmartAnchor>
      <SmartAnchor href="/plog">Blogitems</SmartAnchor>
      <SmartAnchor href="/plog/add">Add blogitem</SmartAnchor>
      <SmartAnchor
        href={
          countUnapprovedComments
            ? "/plog/comments?only=unapproved"
            : "/plog/comments"
        }
      >
        {countUnapprovedComments
          ? `Comments (${countUnapprovedComments})`
          : "Comments"}
      </SmartAnchor>
    </>
  );
}
