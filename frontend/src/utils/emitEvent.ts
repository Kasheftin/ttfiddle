export const emitEvent = (vnode: any, eventName: string, eventDetail?: any) => {
  if (vnode.componentInstance) {
    vnode.componentInstance.$emit(eventName, eventDetail)
  } else {
    const event = new window.CustomEvent(eventName, { detail: eventDetail })
    vnode.el.dispatchEvent(event)
  }
}
