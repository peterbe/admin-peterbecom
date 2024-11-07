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

  return await fetch(url, {
    method,
    body,
    headers,
  })
}
