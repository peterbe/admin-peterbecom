import {
  Avatar,
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  Menu,
} from "@mantine/core"

import { useDisclosure } from "@mantine/hooks"
import { IconHome } from "@tabler/icons-react"
import { Link } from "react-router"
import { useCountUnapprovedComments } from "../hooks/use-count-unapproved-comments"
import { useUserData } from "../whoami/use-userdata"
import { NavigationButtonLink } from "./navigation-button-link"
import { NavigationSearch } from "./navigation-search"
import { SmartAnchor } from "./smart-anchor"

export function Nav() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false)
  const { userData } = useUserData()

  if (!userData?.user) {
    return null
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
                  title={`Signed in as ${
                    userData?.user.email || userData?.user.username
                  }`}
                />
              )}
            </Box>
          </Group>
        </Group>
      </header>
      <Drawer opened={drawerOpened} onClose={closeDrawer} title="Navigation">
        <Divider my="sm" />
        <Group>
          <Links
            onClicked={() => {
              if (drawerOpened) {
                closeDrawer()
              }
            }}
          />
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
  )
}

function Links({ onClicked }: { onClicked?: () => void }) {
  const { data } = useCountUnapprovedComments()

  function onClickedContainer() {
    if (onClicked) {
      onClicked()
    }
  }

  return (
    <div onClick={onClickedContainer} onKeyDown={onClickedContainer}>
      <NavigationButtonLink to="/">Home</NavigationButtonLink>
      <NavigationButtonLink to="/plog">Blogitems</NavigationButtonLink>
      <NavigationButtonLink to="/plog/add">Add blogitem</NavigationButtonLink>
      <NavigationButtonLink
        to={data?.count ? "/plog/comments?only=unapproved" : "/plog/comments"}
      >
        {data?.count ? `Comments (${data.count})` : "Comments"}
      </NavigationButtonLink>
      <NavigationButtonLink to="/analytics/charts">Charts</NavigationButtonLink>
      <Menu shadow="md" trigger="hover" openDelay={100} closeDelay={400}>
        <Menu.Target>
          <Button variant="subtle">Other</Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Analytics</Menu.Label>
          <Menu.Item component={Link} to="/analytics/query">
            Analytics Query
          </Menu.Item>
          <Menu.Item component={Link} to="/analytics/charts">
            Analytics Charts
          </Menu.Item>
          <Menu.Divider />
          <Menu.Label>Misc</Menu.Label>
          <Menu.Item component={Link} to="/plog/categories">
            Categories
          </Menu.Item>
          <Menu.Item component={Link} to="/cdn">
            CDN
          </Menu.Item>
          <Menu.Divider />
          <Menu.Label>Spam</Menu.Label>
          <Menu.Item component={Link} to="/spam/signatures">
            Spam Signatures
          </Menu.Item>
          <Menu.Item component={Link} to="/spam/patterns">
            Spam Patterns
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  )
}
