import { CloseButton, TextInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { useState } from "react"
import { useSearchParams } from "react-router"

export function Search({ disabled }: { disabled?: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const sp = new URLSearchParams(searchParams)
        if (search.trim()) {
          sp.set("search", search)
        } else {
          sp.delete("search")
        }
        setSearchParams(sp)
      }}
    >
      <TextInput
        placeholder="URL, oid, pattern"
        aria-label="URL, oid, pattern"
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        radius="lg"
        rightSection={
          search ? (
            <CloseButton
              aria-label="Clear input"
              onClick={() => {
                setSearch("")
                const sp = new URLSearchParams(searchParams)
                sp.delete("search")
                setSearchParams(sp)
              }}
            />
          ) : (
            <IconSearch />
          )
        }
        disabled={Boolean(disabled)}
      />
    </form>
  )
}
