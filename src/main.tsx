import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App.tsx"

async function enableMocking() {
  if (process.env.NODE_ENV === "test") {
    const { worker } = await import("./mocks/browser")

    // `worker.start()` returns a Promise that resolves
    // once the Service Worker is up and ready to intercept requests.
    return worker.start({
      onUnhandledRequest(request, print) {
        // // Do not print warnings on unhandled requests to Sentry.
        // if (request.url.hostname.includes('sentry.io')) {
        //   return
        // }
        if (new URL(request.url).pathname.startsWith("/api/v0")) {
          // Print the regular MSW unhandled request warning otherwise.
          print.warning()
        }
      },
    })
  }
}

enableMocking().then(() => {
  const root = document.getElementById("root")
  if (!root) throw new Error("no root element found")

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
