import type { DirectiveBinding, VNode } from 'vue'
import { emitEvent } from '@/utils/emitEvent'
import { getEventCoords } from '@/utils/getEventCoords'

const init = (el: HTMLElement, binding: DirectiveBinding, vnode: VNode) => {
  let target = el as HTMLElement & {
    md?: (e: UIEvent) => void
    mu?: (e: UIEvent) => void
    mm?: (e: UIEvent) => void
  }
  let active = true
  let container = window as any
  let tolerance = 0
  let bindingFlags = {} as Record<string, boolean>

  if (typeof binding.value === 'boolean') {
    active = binding.value
  } else if (binding.value && typeof binding.value === 'object') {
    bindingFlags = binding.value

    if (typeof binding.value.target === 'string') {
      target = el.querySelector(binding.value.target)
    }

    if (typeof binding.value.active === 'boolean') {
      active = binding.value.active
    }

    if (typeof binding.value.tolerance === 'number') {
      tolerance = binding.value.tolerance
    }
  }

  const scrollBy = (x: number, y: number) => {
    if (container === window) {
      window.scrollBy(x, y)
    } else {
      container.scrollLeft += x
      container.scrollTop += y
    }
  }

  const reset = () => {
    let lastClientX: number, lastClientY: number, pushed: number
    let isDragging = false
    let isMouseDown = false
    let mouseDownClientX: number, mouseDownClientY: number

    target.md = (e: UIEvent) => {
      if (binding.value && typeof binding.value === 'object') {
        if (typeof binding.value.container === 'string') {
          container = document.querySelector(binding.value.container)
        }
      }
      const result = getEventCoords(e)
      mouseDownClientX = result.pageX
      mouseDownClientY = result.pageY
      isMouseDown = true
    }

    target.mu = () => {
      pushed = 0
      if (isDragging) {
        emitEvent(vnode, 'dragscrollend')
      }
      isDragging = false
      isMouseDown = false
    }

    target.mm = (e: UIEvent) => {
      let newScrollX, newScrollY
      const { pageX, pageY } = getEventCoords(e)

      if (!pushed && isMouseDown && (Math.abs(mouseDownClientX - pageX) + Math.abs(mouseDownClientY - pageY) >= tolerance)) {
        const clickedElement = document.elementFromPoint(pageX - window.scrollX, pageY - window.scrollY) as HTMLElement | null
        const hasNoChildDrag = !!bindingFlags.nochilddrag
        const hasFirstChildDrag = !!bindingFlags.firstchilddrag
        const isEl = clickedElement === target
        const isFirstChild = clickedElement === target.firstChild

        let isDataDraggable = false
        if (isEl) {
          isDataDraggable = true
        } else if (hasFirstChildDrag && isFirstChild) {
          isDataDraggable = true
        } else if (typeof clickedElement?.dataset.dragscroll !== 'undefined') {
          isDataDraggable = true
        } else if (typeof clickedElement?.dataset.noDragscroll !== 'undefined') {
          isDataDraggable = false
        } else {
          isDataDraggable = !hasNoChildDrag
          let clickedElementOrParent = clickedElement
          while (clickedElementOrParent && clickedElementOrParent !== target) {
            if (typeof clickedElementOrParent.dataset.dragscrollNested !== 'undefined') {
              isDataDraggable = true
              break
            } else if (typeof clickedElementOrParent.dataset.noDragscrollNested !== 'undefined') {
              isDataDraggable = false
              break
            } else if (clickedElementOrParent.dataset.dragscrollAttached) {
              isDataDraggable = false
              break
            }
            clickedElementOrParent = clickedElementOrParent.parentElement
          }
        }

        if (isDataDraggable) {
          pushed = 1
          lastClientX = pageX
          lastClientY = pageY
        } else {
          isMouseDown = false
        }
      }

      if (pushed) {
        e.preventDefault()
        if (!isDragging) {
          emitEvent(vnode, 'dragscrollstart')
        }
        isDragging = true

        const isEndX = ((target.scrollLeft + target.clientWidth) >= target.scrollWidth) || target.scrollLeft === 0
        const isEndY = ((target.scrollTop + target.clientHeight) >= target.scrollHeight) || target.scrollTop === 0

        newScrollX = (-lastClientX + (lastClientX = pageX))
        newScrollY = (-lastClientY + (lastClientY = pageY))

        if (bindingFlags.pass) {
          target.scrollLeft -= bindingFlags.y ? -0 : newScrollX
          target.scrollTop -= bindingFlags.x ? -0 : newScrollY
          if (target === document.body) {
            target.scrollLeft -= bindingFlags.y ? -0 : newScrollX
            target.scrollTop -= bindingFlags.x ? -0 : newScrollY
          }
          if (isEndX || bindingFlags.y) {
            scrollBy(-newScrollX, 0)
          }
          if (isEndY || bindingFlags.x) {
            scrollBy(0, -newScrollY)
          }
        } else {
          if (bindingFlags.x) newScrollY = -0
          if (bindingFlags.y) newScrollX = -0

          target.scrollLeft -= newScrollX
          target.scrollTop -= newScrollY
          if (target === document.body) {
            target.scrollLeft -= newScrollX
            target.scrollTop -= newScrollY
          }
        }

        emitEvent(vnode, 'dragscrollmove', {
          deltaX: -newScrollX,
          deltaY: -newScrollY
        })
      }
    }
    target.dataset.dragscrollAttached = 'true'
    target.addEventListener('mousedown', target.md)
    target.addEventListener('touchstart', target.md)
    window.addEventListener('mousemove', target.mm)
    window.addEventListener('touchmove', target.mm)
    window.addEventListener('mouseup', target.mu)
    window.addEventListener('touchend', target.mu)
  }

  if (active) {
    if (document.readyState === 'complete') {
      reset()
    } else {
      window.addEventListener('load', reset)
    }
  } else {
    delete target.dataset.dragscrollAttached
    if (target.md) {
      target.removeEventListener('mousedown', target.md)
      target.removeEventListener('touchstart', target.md)
    }
    if (target.mm) {
      window.removeEventListener('mousemove', target.mm)
      window.removeEventListener('touchmove', target.mm)
    }
    if (target.mu) {
      window.removeEventListener('mouseup', target.mu)
      window.removeEventListener('touchend', target.mu)
    }
  }
}

const destroy = (el: any) => {
  const target = el
  delete target.dataset.dragscrollAttached
  if (target.md) {
    target.removeEventListener('mousedown', target.md)
    target.removeEventListener('touchstart', target.md)
  }
  if (target.mm) {
    window.removeEventListener('mousemove', target.mm)
    window.removeEventListener('touchmove', target.mm)
  }
  if (target.mu) {
    window.removeEventListener('mouseup', target.mu)
    window.removeEventListener('touchend', target.mu)
  }
}

export default {
  mounted: (el: HTMLElement, binding: DirectiveBinding, vnode: VNode) => init(el, binding, vnode),
  updated: (el: HTMLElement, binding: DirectiveBinding, vnode: VNode) => {
    if (JSON.stringify(binding.value) !== JSON.stringify(binding.oldValue)) {
      init(el, binding, vnode)
    }
  },
  unmounted: (el: Element) => destroy(el)
}
