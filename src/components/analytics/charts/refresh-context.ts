import { createContext } from "react"

type RefreshContainerContextType = {
  refresh: string
  setRefresh: (id: string) => void
}
export const RefreshContainerContext =
  createContext<RefreshContainerContextType>({
    refresh: "",
    setRefresh: () => {},
  })
