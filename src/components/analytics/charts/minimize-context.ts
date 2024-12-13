import { createContext } from "react"

type MinimizeContextType = {
  minimized: string[]
  toggleMinimized: (id: string) => void //React.Dispatch<React.SetStateAction<string[]>>
}
export const MinimizeContext = createContext<MinimizeContextType>({
  minimized: [],
  toggleMinimized: () => {},
})
