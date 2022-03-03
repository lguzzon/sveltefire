import { writable } from 'svelte/store'
import { getFirebaseApp } from './helpers'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
export function userStore (opts = { persist: null }) {
  const app = getFirebaseApp()
  const auth = getAuth(app)
  const storageKey = 'sveltefire_user'
  let cached = null
  const { persist } = opts
  if (persist) {
    cached = JSON.parse(opts.persist.getItem(storageKey))
  }
  const store = writable(cached, () => {
    const teardown = onAuthStateChanged(auth, u => {
      set(u)
      persist && opts.persist.setItem(storageKey, JSON.stringify(u))
    })
    return () => { teardown() }
  })
  const { subscribe, set } = store
  return {
    subscribe,
    auth
  }
}
