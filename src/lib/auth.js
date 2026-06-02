async function fetchPrincipal() {
  const response = await fetch('/.auth/me')
  if (!response.ok) {
    return null
  }
  const data = await response.json()
  return data.clientPrincipal ?? null
}

export async function getUser() {
  return fetchPrincipal()
}

export async function requireAuth() {
  const principal = await fetchPrincipal()
  if (principal) {
    return principal
  }
  const redirectUri = window.location.pathname + window.location.search
  window.location.href = `/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(redirectUri)}`
  return new Promise(() => {})
}
