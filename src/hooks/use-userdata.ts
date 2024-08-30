import { useContext } from "react";

import { UserDataContext } from "../contexts/user-context";

export function useUserData() {
  return useContext(UserDataContext);
}
