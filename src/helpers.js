import { getContext } from 'svelte'
export function getFirebaseApp () {
  const { getFirebase } = getContext('firebase')
  return getFirebase()
}
// # sourceMappingURL=helpers.js.map
