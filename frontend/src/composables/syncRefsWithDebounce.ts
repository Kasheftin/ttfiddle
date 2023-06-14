import { watch, onScopeDispose } from 'vue'
import type { Ref } from 'vue'

export function useSyncRefsWithDebounce<T>(refFrom: Ref<T>, refTo: Ref<T>, timeoutForwardDelay = 0, timeoutBackwardDelay = 0, forwardImmediate = false, backwardImmediate = false) {
  let timeoutForward = 0
  let timeoutBackward = 0

  watch(refFrom, (value) => {
    timeoutForward && window.clearTimeout(timeoutForward)
    timeoutForward = window.setTimeout(() => {
      refTo.value = value
    }, timeoutForwardDelay)
  }, { immediate: forwardImmediate })

  watch(refTo, (value) => {
    timeoutBackward && window.clearTimeout(timeoutBackward)
    timeoutBackward = window.setTimeout(() => {
      refFrom.value = value
    }, timeoutBackwardDelay)
  }, { immediate: backwardImmediate })

  onScopeDispose(() => {
    timeoutForward && window.clearTimeout(timeoutForward)
    timeoutBackward && window.clearTimeout(timeoutBackward)
  })
}
