// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/charts/styles.css"
import "@mantine/code-highlight/styles.css"

import { MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router"

import { queryClient } from "./query-client"
import { router } from "./routes"
import { UserDataProvider } from "./whoami/provider"

export default function App() {
  return (
    <MantineProvider defaultColorScheme={"light"}>
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <UserDataProvider>
          <RouterProvider router={router} />
        </UserDataProvider>
      </QueryClientProvider>
    </MantineProvider>
  )
}
