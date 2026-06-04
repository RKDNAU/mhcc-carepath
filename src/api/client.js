const BASE = '/api'

async function apiFetch(path, options = {}) {
  const { body, ...rest } = options
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...rest.headers },
    ...rest,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new Error(msg)
  }
  // Return raw response for non-JSON endpoints (e.g. CSV export)
  return res
}

export async function apiGet(path) {
  return (await apiFetch(path)).json()
}

export async function apiGetText(path) {
  return (await apiFetch(path)).text()
}

export async function apiPost(path, body) {
  return (await apiFetch(path, { method: 'POST', body })).json()
}

export async function apiPatch(path, body) {
  return (await apiFetch(path, { method: 'PATCH', body })).json()
}
