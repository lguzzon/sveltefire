import { getFirebaseApp } from './helpers'
import { getPerformance, trace } from 'firebase/performance'
export function startTrace (name) {
  const firebaseApp = getFirebaseApp()
  const perf = getPerformance(firebaseApp)
  const trhandler = trace(perf, name)
  trhandler.start()
  console.log('Just started performance', name)
  return trhandler
}
export function stopTrace (trace) {
  try {
    trace.stop()
  } catch (_e) {
    // Ignore it cause a stopped trace may end up here again
  }
}
// # sourceMappingURL=perf.js.map
