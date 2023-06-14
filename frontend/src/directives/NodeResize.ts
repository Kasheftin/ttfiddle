import type { DirectiveBinding } from 'vue'
import type { Window, ResizeObserver, ResizeObserverEntry } from './ResizeObserver.d'

export default {
  mounted(el: HTMLBaseElement & { _resizeObserver?: ResizeObserver | null }, binding: DirectiveBinding) {
    let nodeResizeAnimationFrameRequest: number

    if (Object.prototype.hasOwnProperty.call(binding, 'value') && !binding.value) {
      return false
    }

    const bindingTrigger = () => {
      if (binding.value && typeof binding.value === 'function') {
        binding.value({
          width: el.offsetWidth,
          height: el.offsetHeight
        })
      }
    }

    const resizeObserverTrigger = (entries: ResizeObserverEntry[]) => {
      // https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
      // Seems it's not enough since if we call trigger 1000 times, binding.value function will be called as many times;
      nodeResizeAnimationFrameRequest && window.cancelAnimationFrame(nodeResizeAnimationFrameRequest)
      nodeResizeAnimationFrameRequest = window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return false
        }
        bindingTrigger()
      })
    }

    if ((window as unknown as Window).ResizeObserver) {
      if (el._resizeObserver) {
        el._resizeObserver && el._resizeObserver.disconnect()
      }
      el._resizeObserver = new (window as unknown as Window).ResizeObserver(resizeObserverTrigger)
      el._resizeObserver.observe(el)
    }
    bindingTrigger()
  },
  beforeUnmount(el: HTMLBaseElement & { _resizeObserver?: ResizeObserver | null }) {
    if ((window as unknown as Window).ResizeObserver) {
      el._resizeObserver && el._resizeObserver.disconnect()
      el._resizeObserver = null
    }
  }
}
