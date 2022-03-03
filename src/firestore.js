/* eslint-disable no-useless-call */
import { writable } from 'svelte/store'
import { getFirebaseApp } from './helpers'
import {
  doc,
  getFirestore,
  query,
  onSnapshot,
  collection
} from 'firebase/firestore'
import { startTrace, stopTrace } from './perf'
const defaultDocumentOpts = {
  startWith: undefined,
  traceId: undefined,
  log: false,
  maxWait: 10000,
  once: false
}
// Svelte Store for Firestore Document
export function docStore (path, opts) {
  const firebase = getFirebaseApp()
  const firestore = getFirestore(firebase)
  const { startWith, log, traceId, maxWait, once } = {
    ...defaultDocumentOpts,
    ...opts
  }
  // Create the Firestore Reference
  const ref = typeof path === 'string' ? doc(firestore, path) : path
  // Performance trace
  const trace = traceId && startTrace(traceId)
  // Internal state
  let _loading = typeof startWith !== 'undefined'
  let _firstValue = true
  let _error = null
  let _teardown
  let _waitForIt
  // State should never change without emitting a new value
  // Clears loading state on first call
  const next = (val, err) => {
    _loading = false
    _firstValue = false
    _waitForIt && clearTimeout(_waitForIt)
    _error = err || null
    set(val)
    trace && stopTrace(trace)
  }
  // Timout
  // Runs of first subscription
  const start = () => {
    // Timout for fallback slot
    _waitForIt
      = maxWait
      && setTimeout(
        () =>
          _loading
          && next(null, new Error(`Timeout at ${maxWait}. Using fallback slot.`)),
        maxWait
      )
    // Realtime firebase subscription
    _teardown = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data() || (_firstValue && startWith) || null
        // Optional logging
        if (log) {
          console.groupCollapsed(`Doc ${snapshot.id}`)
          console.log(`Path: ${ref.path}`)
          console.log('Snapshot:', snapshot)
          console.groupEnd()
        }
        // Emit next value
        next(data)
        // Teardown after first emitted value if once
        once && _teardown()
      },
      // Handle firebase thrown errors
      (error) => {
        console.error(error)
        next(null, error)
      }
    )
    // Removes firebase listener when store completes
    return () => _teardown()
  }
  // Svelte store
  const store = writable(startWith, start)
  const { subscribe, set } = store
  return {
    subscribe,
    firestore,
    ref,
    get loading () {
      return _loading
    },
    get error () {
      return _error
    }
  }
}
const defaultOpts = {
  idField: 'id',
  refField: 'ref',
  startWith: undefined,
  traceId: undefined,
  log: false,
  maxWait: 10000,
  once: false
}
// Svelte Store for Firestore Collection
export function collectionStore (path, queryFn, opts) {
  const firebase = getFirebaseApp()
  const firestore = getFirestore(firebase)
  const { startWith, log, traceId, maxWait, once, idField, refField } = {
    ...defaultOpts,
    ...opts
  }
  const ref = typeof path === 'string' ? collection(firestore, path) : path
  const constraints = queryFn && queryFn(ref)
  const queryVal
    = constraints
    && (Array.isArray(constraints)
      ? query.apply(null, [ref, ...constraints])
      : query(ref, constraints))
  const trace = traceId && startTrace(traceId)
  let _loading = typeof startWith !== 'undefined'
  let _error = null
  let _meta = {}
  let _teardown
  let _waitForIt
  // Metadata for result
  const calcMeta = (val) => {
    return val && val.length ? { first: val[0], last: val[val.length - 1] } : {}
  }
  const next = (val, err) => {
    _loading = false
    _waitForIt && clearTimeout(_waitForIt)
    _error = err || null
    _meta = calcMeta(val)
    set(val)
    trace && stopTrace(trace)
  }
  const start = () => {
    _waitForIt
      = maxWait
      && setTimeout(
        () =>
          _loading
          && next(null, new Error(`Timeout at ${maxWait}. Using fallback slot.`)),
        maxWait
      )
    _teardown = onSnapshot(
      queryVal || ref,
      (snapshot) => {
        // Will always return an array
        const data = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          // Allow end user override fields mapped for ID and Ref
          ...(idField ? { [idField]: docSnap.id } : null),
          ...(refField ? { [refField]: docSnap.ref } : null)
        }))
        if (log) {
          const type = _loading ? 'New Query' : 'Updated Query'
          console.groupCollapsed(`${type} ${ref.id} | ${data.length} hits`)
          console.log(`${ref.path}`)
          console.log('Snapshot: ', snapshot)
          console.groupEnd()
        }
        next(data)
        once && _teardown()
      },
      (error) => {
        console.error(error)
        next(null, error)
      }
    )
    return () => _teardown()
  }
  const store = writable(startWith, start)
  const { subscribe, set } = store
  return {
    subscribe,
    firestore,
    ref,
    get loading () {
      return _loading
    },
    get error () {
      return _error
    },
    get meta () {
      return _meta
    }
  }
}
// # sourceMappingURL=firestore.js.map
