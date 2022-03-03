import { writable } from 'svelte/store'
import { getFirebaseApp } from './helpers'
import { startTrace, stopTrace } from './perf'
import { getDownloadURL, getMetadata, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
// Svelte Store for Storage file
export function fileDownloadStore (path, opts) {
  const firebaseApp = getFirebaseApp()
  const storage = getStorage(firebaseApp)
  const { log, traceId, startWith, url, meta } = { url: true, ...opts }
  const fref = typeof path === 'string' ? ref(storage, path) : path
  // Performance trace
  const trace = traceId && startTrace(traceId)
  // Internal state
  let _loading = typeof startWith !== undefined
  let _error = null
  // State should never change without emitting a new value
  // Clears loading state on first call
  const next = (val, err) => {
    _loading = false
    _error = err || null
    // TODO log something, maybe?
    set(val)
    trace && stopTrace(trace)
  }
  // Timout
  // Runs of first subscription
  const start = () => {
    const requests = [url && getDownloadURL(fref), meta && getMetadata(fref)]
    Promise.all(requests)
      .then(result => next({
        url: result[0],
        metadata: result[1]
      }))
      .catch(e => next(null, e))
    return () => { }
  }
  // Svelte store
  const store = writable(startWith, start)
  const { subscribe, set } = store
  return {
    subscribe,
    storage,
    ref: fref,
    get loading () {
      return _loading
    },
    get error () {
      return _error
    }
  }
}
export function uploadTaskStore (path, file, opts) {
  const firebaseApp = getFirebaseApp()
  const storage = getStorage(firebaseApp)
  const { log, traceId } = { ...opts }
  const fref = typeof path === 'string' ? ref(storage, path) : path
  // Performance trace
  const trace = traceId && startTrace(traceId)
  // Internal state
  let _error = null
  let _url = '' // download url
  let _task // upload task
  // Emits UploadTaskSnapshot
  const next = (val, err) => {
    _error = err || null
    set(val)
  }
  const start = () => {
    _task = uploadBytesResumable(fref, file)
    const _teardown = _task.on('state_changed', {
      next: (snap) => next(snap),
      error: (e) => next(_task.snapshot, e),
      complete: () => {
        console.log('done')
        getDownloadURL(fref).then(url => {
          next(_task.snapshot)
          _url = url
          if (log) { console.log(`Upload Complete: ${url}`) }
          trace && stopTrace(trace)
        })
      }
    })
    return () => _teardown()
  }
  const store = writable(null, start)
  const { subscribe, set } = store
  return {
    subscribe,
    storage,
    ref: fref,
    get downloadURL () {
      return _url
    },
    get task () {
      return _task
    },
    get error () {
      return _error
    }
  }
}
// # sourceMappingURL=storage.js.map
