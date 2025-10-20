import { useDocumentTitle } from "@mantine/hooks"
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { queryClient } from "../../../query-client"
import { SignedIn } from "../../signed-in"
import { BotAgentRequests } from "./bot-agent-requests"
import { CommentsByReferral } from "./comments-by-referral"
import { GeoLocations } from "./geo-locations"
import { LogoEvents } from "./logo-events"
import { LyricsFeatureflag } from "./lyrics-featureflag"
import { LyricsPages } from "./lyrics-pages"
import { MinimizeContext } from "./minimize-context"
import { PageviewEvents } from "./pageview-events"
import { PageviewNumbers } from "./pageview-numbers"
import { Pageviews } from "./pageviews"
import { PublicAPIPageviews } from "./publicapi-pageviews"
import { PublicAPIPageviewsDurations } from "./publicapi-pageviews-durations"
import { RefreshContainerContext } from "./refresh-context"
import { RequestsPerDay } from "./requests-per-day"
import { RequestsVaryingQuerystring } from "./requests-varying-querystring"
import { useMinimized } from "./use-minimized"
import { useRefreshContainer } from "./use-refresh-container"
import { UserAgents } from "./user-agents"

const persister = createAsyncStoragePersister({
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
            <PublicAPIPageviews />
            <PublicAPIPageviewsDurations />
            <LogoEvents />
            <UserAgents />
            <CommentsByReferral />
            <LyricsPages />
            <BotAgentRequests />
            <RequestsPerDay />
            <RequestsVaryingQuerystring />
            <LyricsFeatureflag />
            <PageviewEvents />
            <GeoLocations />
            <ReactQueryDevtools initialIsOpen={false} />
          </RefreshContainerContext.Provider>
        </MinimizeContext.Provider>
      </PersistQueryClientProvider>
    </SignedIn>
  )
}
