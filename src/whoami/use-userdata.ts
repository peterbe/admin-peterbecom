import { useContext } from "react"

import { UserDataContext } from "./context"

export function useUserData() {
  return useContext(UserDataContext)
}
