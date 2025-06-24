import { useDocumentTitle } from "@mantine/hooks"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"

import { SignedIn } from "../../signed-in"
import { BotAgentRequests } from "./bot-agent-requests"
import { GeoLocations } from "./geo-locations"
import { LyricsFeatureflag } from "./lyrics-featureflag"
import { MinimizeContext } from "./minimize-context"
import { PageviewEvents } from "./pageview-events"
import { PageviewNumbers } from "./pageview-numbers"
import { Pageviews } from "./pageviews"
import { RefreshContainerContext } from "./refresh-context"
import { useMinimized } from "./use-minimized"
import { useRefreshContainer } from "./use-refresh-container"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

const persister = createSyncStoragePersister({
  storage: window.localStorage,
})

export function Component() {
  useDocumentTitle("Charts")

  const [minimized, toggleMinimized] = useMinimized()
  const [refresh, setRefresh] = useRefreshContainer()
  return (
    <SignedIn>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <MinimizeContext.Provider value={{ minimized, toggleMinimized }}>
          <RefreshContainerContext.Provider value={{ refresh, setRefresh }}>
            <PageviewNumbers />
            <Pageviews />
            <BotAgentRequests />
            <LyricsFeatureflag />
            <PageviewEvents />
            <GeoLocations />
          </RefreshContainerContext.Provider>
        </MinimizeContext.Provider>
      </PersistQueryClientProvider>
    </SignedIn>
  )
}
