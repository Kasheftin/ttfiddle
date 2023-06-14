export const addEventListeners = (el: HTMLElement, events: Array<keyof HTMLElementEventMap>, handler: EventListenerOrEventListenerObject) => {
  for (let i = 0, len = events.length; i < len; i++) {
    el.addEventListener(events[i], handler, { passive: false })
  }
}

export const removeEventListeners = (el: HTMLElement, events: Array<keyof HTMLElementEventMap>, handler: EventListener) => {
  for (let i = 0, len = events.length; i < len; i++) {
    el.removeEventListener(events[i], handler)
  }
}
