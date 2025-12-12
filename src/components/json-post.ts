export async function JSONPost(
  url: string,
  data: FormData,
  csrfToken: string,
  { method = "POST" } = {},
) {
  const body = data instanceof FormData ? data : JSON.stringify(data)

  const headers = {
    "X-CSRFToken": csrfToken,
  }
  if (method === "GET") {
    return await fetch(url, { method, headers })
  }

  return await fetch(url, {
    method,
    body,
    headers,
  })
}
