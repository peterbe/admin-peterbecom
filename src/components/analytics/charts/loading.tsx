import { LoadingOverlay } from "@mantine/core"

export function Loading({ visible }: { visible: boolean }) {
  return (
    <LoadingOverlay
      visible={visible}
      zIndex={1000}
      overlayProps={{ radius: "sm", blur: 2 }}
    />
  )
}
