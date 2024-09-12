import { Alert, Box, Button, LoadingOverlay } from "@mantine/core";
import type { ReactNode } from "react";

import { useUserData } from "../hooks/use-userdata";
import { Authenticate } from "./authenticate";

export function SignedIn({ children }: { children: ReactNode }) {
  const { userData, userError } = useUserData();

  if (userError) {
    return (
      <div>
        <Alert color="red" title="Network error">
          <p>Something went wrong with your authentication.</p>
          <p>
            <b>Error:</b> <code>{userError.toString()}</code>
          </p>
          <Button
            variant="outline"
            color="red"
            onClick={() => {
              window.location.reload();
            }}
          >
            Try reloading
          </Button>
        </Alert>
      </div>
    );
  }
  if (!userData) {
    return <LoadingOverlay visible={true} />;
  }
  if (!userData.user) {
    return <Authenticate />;
    // return null
  }
  return <Box style={{ marginBottom: 100 }}>{children}</Box>;
}
