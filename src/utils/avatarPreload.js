const loadedAvatars = new Set()
const failedAvatars = new Set()
const pendingAvatars = new Map()

export function avatarSrc(name) {
  return `/img/avatars/${encodeURIComponent(name)}.png`
}

export function isAvatarLoaded(name) {
  return loadedAvatars.has(avatarSrc(name))
}

export function isAvatarFailed(name) {
  return failedAvatars.has(avatarSrc(name))
}

export function preloadAvatar(name) {
  if (!name) return null
  const src = avatarSrc(name)
  if (loadedAvatars.has(src) || failedAvatars.has(src)) return null
  if (pendingAvatars.has(src)) return pendingAvatars.get(src)

  const promise = new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      loadedAvatars.add(src)
      pendingAvatars.delete(src)
      resolve({ src, loaded: true })
    }
    img.onerror = () => {
      failedAvatars.add(src)
      pendingAvatars.delete(src)
      resolve({ src, loaded: false })
    }
    img.src = src
  })

  pendingAvatars.set(src, promise)
  return promise
}

export function preloadAvatars(names) {
  return Promise.all(names.map(preloadAvatar).filter(Boolean))
}

export function markAvatarLoaded(name) {
  loadedAvatars.add(avatarSrc(name))
}

export function markAvatarFailed(name) {
  failedAvatars.add(avatarSrc(name))
}
