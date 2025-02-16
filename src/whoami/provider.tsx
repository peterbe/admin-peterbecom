import { useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { fetchWhoami, whoamiQueryKey } from "../components/api-utils"
import { UserDataContext } from "./context"
import type { UserContext, UserData } from "./types"

// The argument for using sessionStorage rather than localStorage is because
// it's marginally simpler and "safer". For example, if we use localStorage
// it might stick in the browser for a very long time and we might change
// the structure of that JSON we store in there.
// Also, localStorage doesn't go away. So if we decide to not do this stuff
// anymore we won't have users who have that stuff stuck in their browser
// "forever".
const SESSION_STORAGE_KEY = "admin-peterbecom-whoami"

function getSessionStorageData() {
  try {
    const data = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      // To avoid trusting in `as UserData` as a type, let's check it manually
      if (parsed.user) {
        for (const key of ["username", "email", "picture_url"]) {
          if (typeof parsed.user[key] !== "string") {
            return false
          }
        }
        return parsed as UserData
      }
      return false
    }
  } catch (error) {
    console.warn("sessionStorage.getItem didn't work", error)
    return null
  }
}

function removeSessionStorageData() {
  try {
    // It's safe to call .removeItem() on a key that doesn't already exist,
    // and it's pointless to first do a .hasItem() before the .removeItem()
    // because internally that's what .removeItem() already does.
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
  } catch (error) {
    console.warn("sessionStorage.removeItem didn't work", error)
  }
}

function setSessionStorageData(data: UserData) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn("sessionStorage.setItem didn't work", error)
  }
}

type WhoamiResponse = UserData & {
  is_authencated: true
}
export function UserDataProvider(props: { children: ReactNode }) {
  const { data, error, isError } = useQuery<WhoamiResponse>({
    queryKey: whoamiQueryKey(),
    queryFn: fetchWhoami,
  })

  useEffect(() => {
    if (isError) {
      removeSessionStorageData()
    } else if (data) {
      // At this point, the XHR request has set `data` to be an object.
      // The user is definitely signed in or not signed in.
      setSessionStorageData(data)
    }
  }, [data, isError])

  const isServer = typeof window === "undefined"

  const value: UserContext = {
    userData: data || (!isServer && getSessionStorageData()) || null,
    userError: error || null,
  }

  return (
    <UserDataContext.Provider value={value}>
      {props.children}
    </UserDataContext.Provider>
  )
}
