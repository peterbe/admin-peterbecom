import { API_BASE } from "../../config"

export async function postPreview({
  text,
  displayFormat,
}: {
  text: string
  displayFormat: string
}) {
  const response = await fetch(`${API_BASE}/plog/preview/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      display_format: displayFormat,
      title: "Anything",
    }),
  })

  if (response.ok || response.status === 400) {
    return response.json()
  }
  throw new Error(`${response.status} on ${response.url}`)
}
