// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
// import "@mantine/charts/styles.css";
// import "./styles/globals.css";

import { MantineProvider } from "@mantine/core";
import { Container } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Nav } from "./components/simple-nav";
import { UserDataProvider } from "./contexts/user-context";
import { Routes } from "./routes";

const queryClient = new QueryClient();

export default function App() {
  return (
    <MantineProvider defaultColorScheme={"light"}>
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <UserDataProvider>
          <BasicAppShell />
        </UserDataProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export function BasicAppShell() {
  return (
    <Container fluid size="xl">
      <Nav />
      <Routes />
    </Container>
  );
}
