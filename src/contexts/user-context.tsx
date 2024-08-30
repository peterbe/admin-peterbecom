import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createContext, useEffect } from "react";

import type { User } from "../types";

export type UserData = {
  user: null | User;
};

type UserContext = {
  userData: UserData | null;
  userError: Error | null;
};

// const UserDataContext = createContext<UserData | null>(null)
export const UserDataContext = createContext<UserContext>({
  userData: null,
  userError: null,
});

// The argument for using sessionStorage rather than localStorage is because
// it's marginally simpler and "safer". For example, if we use localStorage
// it might stick in the browser for a very long time and we might change
// the structure of that JSON we store in there.
// Also, localStorage doesn't go away. So if we decide to not do this stuff
// anymore we won't have users who have that stuff stuck in their browser
// "forever".
const SESSION_STORAGE_KEY = "analytics-dashboard-peterbecom-whoami";

function getSessionStorageData() {
  try {
    const data = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Because it was added late, if the stored value doesn't contain
      // then following keys, consider the stored data stale.
      if (!parsed.geo) {
        // If we don't do this check, you might be returning stored data
        // that doesn't match any of the new keys.
        return false;
      }
      return parsed as UserData;
    }
  } catch (error) {
    console.warn("sessionStorage.getItem didn't work", error);
    return null;
  }
}

function removeSessionStorageData() {
  try {
    // It's safe to call .removeItem() on a key that doesn't already exist,
    // and it's pointless to first do a .hasItem() before the .removeItem()
    // because internally that's what .removeItem() already does.
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn("sessionStorage.removeItem didn't work", error);
  }
}

function setSessionStorageData(data: UserData) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("sessionStorage.setItem didn't work", error);
  }
}

export function UserDataProvider(props: { children: ReactNode }) {
  const { data, error } = useQuery({
    queryKey: ["whoami"],
    queryFn: async () => {
      const response = await fetch("/api/v0/whoami");
      if (!response.ok) {
        removeSessionStorageData();
        throw new Error(`${response.status} on ${response.url}`);
      }
      const data = await response.json();
      const { user } = data;
      return {
        user,
      };
    },
  });

  useEffect(() => {
    if (data) {
      // At this point, the XHR request has set `data` to be an object.
      // The user is definitely signed in or not signed in.
      setSessionStorageData(data);
    }
  }, [data]);

  const isServer = typeof window === "undefined";

  const value: UserContext = {
    userData: data || (!isServer && getSessionStorageData()) || null,
    userError: error || null,
  };

  return (
    <UserDataContext.Provider value={value}>
      {props.children}
    </UserDataContext.Provider>
  );
}
