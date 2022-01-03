import { writable, get } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { getFirebaseApp } from './helpers';
import { getAuth, onAuthStateChanged, updateProfile as fbupdateProfile } from "firebase/auth";
import type { User, Auth } from "firebase/auth";

export type UserStoreOpts = {
  persist: Storage;
}

export type UserDataStore = Readable<User> & {
  auth: Auth;
};

const intUser = writable<User>();
let inited = false;

export let user :UserDataStore = {
  subscribe: intUser.subscribe,
  auth: null
};

/**
* @deprecated Use 'initUserStore' to provide configuration the use the 'user' store directly
*/
export function userStore(opts :UserStoreOpts = { persist: null }) :UserDataStore {
  initUserStore(opts);
  return user;
}

/**
 * Same as Firebase updateProfile, but propagates the update to the
 * user store so that your UI can update. Also, it operates on currently 
 * logged in user.
 * @param update the update to perform on the user
 * @returns void
 */
export function updateProfile(update: {
  displayName?: string | null;
  photoURL?: string | null;
}): Promise<void> {
  let user = get(intUser);
  return fbupdateProfile(user, update)
    .then(() => intUser.set(user));
}



export function initUserStore(opts :UserStoreOpts = { persist: null }) {
    if (inited) {
      return;
    }
    inited = true;

    const app = getFirebaseApp();
    const auth = getAuth(app);

    const storageKey = 'sveltefire_user';
    let cached = null;
  
    const { persist } = opts;
  
    if (persist) {
      cached = JSON.parse(persist.getItem(storageKey));
    }
  
    user.auth = auth;
    if (cached) {
      intUser.set(cached);
    }
    onAuthStateChanged(auth, u => {
      intUser.set(u);
      persist && persist.setItem(storageKey, JSON.stringify(u));
    });
  }
  