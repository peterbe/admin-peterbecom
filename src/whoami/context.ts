import { createContext } from "react";
import type { UserContext } from "./types";

export const UserDataContext = createContext<UserContext>({
  userData: null,
  userError: null,
});
