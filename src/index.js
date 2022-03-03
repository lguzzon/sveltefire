import FirebaseApp from './FirebaseApp.svelte'
import User from './User.svelte'
import Doc from './Doc.svelte'
import Collection from './Collection.svelte'
import { userStore } from './auth'
import { docStore, collectionStore } from './firestore'
import { fileDownloadStore, uploadTaskStore } from './storage'
import StorageRef from './StorageRef.svelte'
import UploadTask from './UploadTask.svelte'
import { getFirebaseApp } from './helpers'

export {
  FirebaseApp,
  getFirebaseApp,
  User,
  Doc,
  Collection,
  /**
    * @deprecated Use 'initUserStore' to provide configuration the use the 'user' store directly
    */
  userStore,
  docStore,
  collectionStore,
  fileDownloadStore,
  uploadTaskStore,
  StorageRef,
  UploadTask
}
