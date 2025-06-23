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
import { useMinimized } from "./use-minimized"

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
  return (
    <SignedIn>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <MinimizeContext.Provider value={{ minimized, toggleMinimized }}>
          <PageviewNumbers />
          <Pageviews />
          <BotAgentRequests />
          <LyricsFeatureflag />
          <PageviewEvents />
          <GeoLocations />
        </MinimizeContext.Provider>
      </PersistQueryClientProvider>
    </SignedIn>
  )
}
