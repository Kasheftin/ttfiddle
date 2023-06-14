import { ref, computed, type MaybeRef, unref, isRef, onScopeDispose } from 'vue'
import { getEventCoords } from '@/utils/getEventCoords'

type UseDragOptions = {
  value: MaybeRef<number>
  direction: 'horizontal' | 'vertical' | 'horizontal-rev' | 'vertical-rev'
  min?: MaybeRef<number>
  max?: MaybeRef<number>
}

export function useDrag({ value, direction, min, max }: UseDragOptions) {
  const isDragging = ref(false)
  const dragStartPosition = ref(0)
  const dragPosition = ref(0)
  const dragStartCoords = ref({ pageX: 0, pageY: 0 })

  const dragStart = (event: UIEvent) => {
    event.preventDefault()
    dragStartCoords.value = getEventCoords(event)
    dragStartPosition.value = unref(value)
    dragPosition.value = unref(value)
    isDragging.value = true
    window.addEventListener('mousemove', dragMove)
    window.addEventListener('mouseup', dragEnd)
    window.addEventListener('touchmove', dragMove)
    window.addEventListener('touchup', dragEnd)
  }

  const dragMove = (event: UIEvent) => {
    const coords = getEventCoords(event)
    let v = dragStartPosition.value
    if (direction === 'horizontal' || direction === 'horizontal-rev') {
      v += (coords.pageX - dragStartCoords.value.pageX) * (direction === 'horizontal-rev' ? -1 : 1)
    } else if (direction === 'vertical' || direction === 'vertical-rev') {
      v += (coords.pageY - dragStartCoords.value.pageY) * (direction === 'vertical-rev' ? -1 : 1)
    }
    const minValue = min ? unref(min) : undefined
    const maxValue = max ? unref(max) : undefined
    if (typeof minValue === 'number') {
      v = Math.max(minValue, v)
    }
    if (typeof maxValue === 'number') {
      v = Math.min(maxValue, v)
    }
    dragPosition.value = v
  }

  const dragEnd = () => {
    if (isDragging.value) {
      window.removeEventListener('mousemove', dragMove)
      window.removeEventListener('mouseup', dragEnd)
      window.removeEventListener('touchmove', dragMove)
      window.removeEventListener('touchup', dragEnd)
      if (isRef(value)) {
        value.value = dragPosition.value
      }
      isDragging.value = false
    }
  }

  const valueImmediate = computed(() => {
    let v = isDragging.value ? dragPosition.value : unref(value)
    const minValue = min ? unref(min) : undefined
    const maxValue = max ? unref(max) : undefined
    if (typeof minValue === 'number') {
      v = Math.max(minValue, v)
    }
    if (typeof maxValue === 'number') {
      v = Math.min(maxValue, v)
    }
    return v
  })

  onScopeDispose(() => dragEnd())

  return { dragStart, valueImmediate }
}
