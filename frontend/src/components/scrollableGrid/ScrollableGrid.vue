<template>
  <div
    ref="elRef"
    v-node-resize="setContainerSize"
    :style="{ position: 'absolute' }"
    class="tt-grid-css"
  >
    <!-- position: absolute above required for old edge 18 -->
    <div :style="stubHeadBox" class="tt-grid-css__stub-head">
      <slot name="stub-head" v-bind="commonSlotProps" />
      <div
        v-if="props.sideResizeable"
        class="tt-grid-css__side-resize"
        draggable="false"
        @mousedown="sideResizeStartHandler"
        @touchstart="sideResizeStartHandler"
      />
    </div>
    <div v-if="props.preventPointerEvents" class="tt-grid-css__prevent-pointer-events-cover" />
    <div
      ref="scrollRef"
      v-dragscroll="dragScrollOptions"
      class="tt-grid-css__scroll"
      @scroll="setScrolls"
      @dragscrollstart="dragScrollIsActive = true"
      @dragscrollend="dragScrollIsActive = false"
      @mousedown="pushed = true"
      @touchstart="pushed = true"
    >
      <!-- Wrapper is very important. There's safari bug - all the children inside a scrollable container must be placed into one container, otherwise sticky children work glitchy -->
      <div class="tt-grid-css__wrapper">
        <div
          :style="headBox"
          :class="headClass"
          class="tt-grid-css__head"
        >
          <slot name="head" v-bind="commonSlotProps" />
        </div>
        <div
          :style="sideBox"
          class="tt-grid-css__side"
        >
          <slot name="side" v-bind="commonSlotProps" />
          <div
            v-if="props.sideResizeable"
            class="tt-grid-css__side-resize"
            draggable="false"
            @mousedown="sideResizeStartHandler"
            @touchstart="sideResizeStartHandler"
          />
        </div>
        <div
          :style="bodyBox"
          class="tt-grid-css__body"
          @mousemove="emit('body:mousemove', $event)"
          @mouseleave="emit('body:mouseleave', $event)"
        >
          <div
            v-node-resize="setBodySize"
            :style="bodyInnerBox"
            class="tt-grid-css__body-inner"
          >
            <slot name="body" v-bind="commonSlotProps" />
          </div>
        </div>
      </div>
    </div>
    <slot name="default" v-bind="commonSlotProps" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { addCssSuffix } from '@/utils/addCssSuffix'
import { getEventCoords } from '@/utils/getEventCoords'

type Maybe<T> = T | null

type Dimensions = {
  width: number
  height: number
}

type SimpleBox = Dimensions & {
  top: number
  left: number
}

type SimpleBoxWithScroll = SimpleBox & {
  scrollWidth: number
  scrollHeight: number
}

type Props = {
  headSize?: number
  sideSize?: number
  sideSizeMin?: number
  sideSizeMax?: Maybe<number>
  headWidth?: Maybe<number>
  sideHeight?: Maybe<number>
  xScroll?: Maybe<number>
  yScroll?: Maybe<number>
  syncPropDirection?: string
  edgeScrollEnabled?: boolean | 'vertical' | 'horizontal' | 'false' | 'true'
  edgeSize?: number
  edgeScrollSpeed?: number
  sideResizeable?: boolean
  fillHeight?: boolean
  fillWidth?: boolean
  fillHeightBottomOffset?: number
  fillWidthRightOffset?: number
  dragScrollEnabled?: boolean
  scrollSyncDelay?: number
  preventPointerEvents?: boolean
  dragScrollOptions?: Record<string, unknown>
  dragScrollEndDelayTimeout?: number
  headClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  headSize: 0,
  sideSize: 0,
  sideSizeMin: 0,
  sideSizeMax: null,
  headWidth: null,
  sideHeight: null,
  xScroll: null,
  yScroll: null,
  syncPropDirection: 'inner->value',
  edgeScrollEnabled: false,
  edgeSize: 50,
  edgeScrollSpeed: 30,
  edgeResizeable: false,
  fillHeight: false,
  fillWidth: false,
  fillHeightBottomOffset: 20,
  fillWidthRightOffset: 20,
  dragScrollEnabled: false,
  scrollSyncDelay: 0,
  preventPointerEvents: false,
  headClass: '',
  dragScrollOptions: () => ({}),
  dragScrollEndDelayTimeout: 200
})

const emit = defineEmits([
  'update:xScroll',
  'update:yScroll',
  'update:containerBox',
  'dragscrollstart',
  'dragscrollend',
  'dragscrollendDelayed',
  'update:sideSize',
  'update:bodyWidth',
  'update:bodyHeight',
  'sideResizeStop',
  'body:mousemove',
  'body:mouseleave'
])

const xScroll = ref<Maybe<number>>(0)
const yScroll = ref<Maybe<number>>(0)
const setXScroll = (value: Maybe<number>) => {
  xScroll.value = value
  emit('update:xScroll', value)
  if (typeof value === 'number' && scrollRef.value instanceof HTMLElement) {
    scrollRef.value.scrollLeft = value
  }
}
const setYScroll = (value: Maybe<number>) => {
  yScroll.value = value
  emit('update:yScroll', value)
  if (typeof value === 'number' && scrollRef.value instanceof HTMLElement) {
    scrollRef.value.scrollTop = value
  }
}
const commonSlotProps = computed(() => ({
  xScroll: xScroll.value,
  yScroll: yScroll.value,
  setXScroll,
  setYScroll
}))

const edgeScrollBox = ref<Maybe<SimpleBoxWithScroll>>(null)
const externalContainerBox = ref<Maybe<SimpleBox>>(null)

const scrollRef = ref<Maybe<HTMLElement>>(null)
const elRef = ref<Maybe<HTMLElement>>(null)

const sideResizing = ref({
  enabled: false,
  startCoords: {
    pageX: 0,
    pageY: 0
  },
  startSideSize: 0
})

const containerWidth = ref<Maybe<number>>(null)
const containerHeight = ref<Maybe<number>>(null)
const bodyWidth = ref<Maybe<number>>(null)
const bodyHeight = ref<Maybe<number>>(null)

const edgeTimeout = ref(0)
const pushed = ref(false)
const dragScrollIsActive = ref(false)

const edgeScrollEnabled = computed(() => {
  if (props.edgeScrollEnabled === 'false') {
    return false
  }
  if (props.edgeScrollEnabled === 'true') {
    return true
  }
  return props.edgeScrollEnabled
})

const dragScrollOptions = computed(() => ({
  pass: true,
  tolerance: 10,
  ...(props.dragScrollOptions || {}),
  active: props.dragScrollEnabled
}))

const stubHeadBox = computed(() => addCssSuffix({
  height: props.headSize,
  width: props.sideSize
}))

const headBox = computed(() => addCssSuffix({
  height: props.headSize,
  width: Math.max(props.headWidth || 0, bodyWidth.value || 0),
  marginLeft: props.sideSize
}))

const sideBox = computed(() => addCssSuffix({
  height: Math.max(props.sideHeight || 0, bodyHeight.value || 0),
  width: props.sideSize
}))

const bodyBox = computed(() => addCssSuffix({
  top: props.headSize,
  right: props.fillWidth ? props.fillWidthRightOffset : null,
  bottom: props.fillHeight ? props.fillHeightBottomOffset : null,
  left: props.sideSize
}))

const bodyInnerBox = computed(() => {
  const out: Record<string, string | number> = {}
  if (props.fillWidth) {
    // out.width = '100%'
    if (containerWidth.value) {
      out.minWidth = containerWidth.value - props.sideSize - 20
    } else {
      out.right = 20
    }
  }
  if (props.fillHeight) {
    if (containerHeight.value) {
      out.minHeight = containerHeight.value - props.headSize - props.fillHeightBottomOffset
    } else {
      out.bottom = props.fillHeightBottomOffset
    }
  }
  return addCssSuffix(out)
})

const preventTextSelection = (value: boolean) => {
  if (value) {
    document.body.classList.add('ey-text-unselectable')
  } else {
    document.body.classList.remove('ey-text-unselectable')
  }
}

const preventNativeDragScroll = (value: boolean) => {
  if (value) {
    window.addEventListener('touchmove', preventDefault, { passive: false })
  } else {
    window.removeEventListener('touchmove', preventDefault)
  }
}

const preventDefault = (event: UIEvent) => {
  if (event.cancelable) {
    event.preventDefault()
  }
}

const mouseMoveHandler = (event: UIEvent) => {
  if (pushed.value && edgeScrollEnabled.value) {
    event.preventDefault()
  }
  sideResizeHandler(event)
  handleEdgeScroll(event)
}

const mouseUpHandler = () => {
  pushed.value = false
  sideResizeStopHandler()
}

const setBodySize = (dimensions: Dimensions) => {
  bodyWidth.value = dimensions.width
  bodyHeight.value = dimensions.height
}

const setContainerSize = (dimensions: Dimensions) => {
  containerWidth.value = dimensions.width
  containerHeight.value = dimensions.height
}

const setScrolls = (event: UIEvent) => {
  preventDefault(event)
  if (scrollRef.value instanceof HTMLElement) {
    if (!edgeScrollEnabled.value) {
      xScroll.value = scrollRef.value.scrollLeft
      yScroll.value = scrollRef.value.scrollTop
    } else {
      if (typeof xScroll.value === 'number') {
        scrollRef.value.scrollLeft = xScroll.value
      }
      if (typeof yScroll.value === 'number') {
        scrollRef.value.scrollTop = yScroll.value
      }
    }
  }
}

const handleEdgeScroll = (event: UIEvent) => {
  if (!edgeScrollEnabled.value || !edgeScrollBox.value) {
    return false
  }
  const eventCoords = getEventCoords(event)
  const coords = {
    x: eventCoords.pageX - edgeScrollBox.value.left,
    y: eventCoords.pageY - edgeScrollBox.value.top
  }
  const isInLeftEdge = coords.x < props.edgeSize
  const isInRightEdge = coords.x > edgeScrollBox.value.width - props.edgeSize
  const isInTopEdge = coords.y < props.edgeSize
  const isInBottomEdge = coords.y > edgeScrollBox.value.height - props.edgeSize
  if (!isInLeftEdge && !isInRightEdge && !isInTopEdge && !isInBottomEdge) {
    edgeTimeout.value && clearTimeout(edgeTimeout.value)
    edgeTimeout.value = 0
    return false
  }
  const maxScrollX = (edgeScrollBox.value.scrollWidth - edgeScrollBox.value.width - props.sideSize)
  const maxScrollY = (edgeScrollBox.value.scrollHeight - edgeScrollBox.value.height - props.headSize)
  const adjustScroll = () => {
    if (!edgeScrollEnabled.value || !edgeScrollBox.value) {
      return false
    }
    const canScrollLeft = typeof xScroll.value === 'number' && xScroll.value > 0
    const canScrollRight = typeof xScroll.value === 'number' && xScroll.value < maxScrollX
    const canScrollUp = typeof yScroll.value === 'number' && yScroll.value > 0
    const canScrollDown = typeof yScroll.value === 'number' && yScroll.value < maxScrollY
    let nextX = xScroll.value || 0
    let nextY = yScroll.value || 0
    if (isInLeftEdge && canScrollLeft) {
      nextX -= props.edgeScrollSpeed * Math.min(1, (props.edgeSize - coords.x) / props.edgeSize)
    }
    if (isInRightEdge && canScrollRight) {
      nextX += props.edgeScrollSpeed * Math.min(1, (props.edgeSize - edgeScrollBox.value.width + coords.x) / props.edgeSize)
    }
    if (isInTopEdge && canScrollUp) {
      nextY -= props.edgeScrollSpeed * Math.min(1, (props.edgeSize - coords.y) / props.edgeSize)
    }
    if (isInBottomEdge && canScrollDown) {
      nextY += props.edgeScrollSpeed * Math.min(1, (props.edgeSize - edgeScrollBox.value.height + coords.y) / props.edgeSize)
    }
    nextX = Math.max(0, Math.min(maxScrollX, nextX))
    nextY = Math.max(0, Math.min(maxScrollY, nextY))
    if (edgeScrollEnabled.value === 'vertical') {
      if (nextY !== yScroll.value) {
        yScroll.value = nextY
        if (scrollRef.value instanceof HTMLElement) {
          scrollRef.value.scrollTop = nextY
        }
        return true
      } else {
        return false
      }
    } else if (edgeScrollEnabled.value === 'horizontal') {
      if (nextX !== xScroll.value) {
        xScroll.value = nextX
        if (scrollRef.value instanceof HTMLElement) {
          scrollRef.value.scrollLeft = nextX
        }
        return true
      } else {
        return false
      }
    } else {
      if (nextX !== xScroll.value || nextY !== yScroll.value) {
        xScroll.value = nextX
        yScroll.value = nextY
        if (scrollRef.value instanceof HTMLElement) {
          scrollRef.value.scrollLeft = nextX
          scrollRef.value.scrollTop = nextY
        }
        return true
      } else {
        return false
      }
    }
  }
  const run = () => {
    edgeTimeout.value && clearTimeout(edgeTimeout.value)
    edgeTimeout.value = 0
    if (adjustScroll()) {
      edgeTimeout.value = window.setTimeout(run, 30)
    }
  }
  run()
}

const sideResizeStartHandler = (event: UIEvent) => {
  if (!props.sideResizeable) {
    return false
  }
  sideResizing.value = {
    enabled: true,
    startCoords: getEventCoords(event),
    startSideSize: props.sideSize
  }
}

const sideResizeHandler = (event: UIEvent) => {
  if (!props.sideResizeable || !sideResizing.value.enabled) {
    return false
  }
  const coords = getEventCoords(event)
  const offset = coords.pageX - (sideResizing.value.startCoords.pageX)
  const newSideSize = restrictNumberIn((sideResizing.value.startSideSize) + offset, props.sideSizeMin, props.sideSizeMax)
  if (newSideSize !== props.sideSize) {
    emit('update:sideSize', newSideSize)
  }
}

const sideResizeStopHandler = () => {
  if (!props.sideResizeable || !sideResizing.value.enabled) {
    return false
  }
  sideResizing.value.enabled = false
  emit('sideResizeStop')
}

const restrictNumberIn = (number: number, min: Maybe<number>, max: Maybe<number>) => {
  if (min !== null) {
    number = Math.max(number, min)
  }
  if (max !== null) {
    number = Math.min(number, max)
  }
  return number
}

watch(() => props.xScroll, (value) => {
  if (typeof value === 'number' && props.syncPropDirection === 'value->inner') {
    xScroll.value = value
    if (scrollRef.value instanceof HTMLElement) {
      scrollRef.value.scrollLeft = value
    }
  }
}, { immediate: true })

watch(() => props.yScroll, (value) => {
  if (typeof value === 'number' && props.syncPropDirection === 'value->inner') {
    yScroll.value = value
    if (scrollRef.value instanceof HTMLElement) {
      scrollRef.value.scrollTop = value
    }
  }
}, { immediate: true })

watchDebounced(xScroll, (value) => {
  if (props.syncPropDirection === 'inner->value') {
    emit('update:xScroll', value)
  }
}, { debounce: props.scrollSyncDelay })

watchDebounced(yScroll, (value) => {
  if (props.syncPropDirection === 'inner->value') {
    emit('update:yScroll', value)
  }
}, { debounce: props.scrollSyncDelay })

watch(() => [edgeScrollEnabled.value, scrollRef.value], () => {
  if (edgeScrollEnabled.value && scrollRef.value instanceof HTMLElement) {
    const rect = scrollRef.value.getBoundingClientRect()
    edgeScrollBox.value = {
      top: rect.top + props.headSize,
      left: rect.left + props.sideSize,
      width: rect.width - props.sideSize,
      height: rect.height - props.headSize,
      scrollWidth: scrollRef.value.scrollWidth,
      scrollHeight: scrollRef.value.scrollHeight
    }
  } else {
    edgeScrollBox.value = null
  }
  preventNativeDragScroll(!!edgeScrollEnabled.value)
}, { immediate: true })

watch(() => props.preventPointerEvents, (value) => {
  preventTextSelection(value)
}, { immediate: true })

watch(() => [props.headSize, props.sideSize, containerWidth.value, containerHeight.value, elRef.value], () => {
  if (elRef.value instanceof HTMLElement) {
    const rect = elRef.value.getBoundingClientRect()
    externalContainerBox.value = {
      top: rect.top + props.headSize,
      left: rect.left + props.sideSize,
      width: rect.width - props.sideSize,
      height: rect.height - props.headSize
    }
  }
}, { immediate: true })

watch(() => JSON.stringify(externalContainerBox.value), () => {
  emit('update:containerBox', externalContainerBox.value)
})

watch(dragScrollIsActive, (value) => {
  preventTextSelection(value)
  if (value) {
    emit('dragscrollstart')
  } else {
    emit('dragscrollend')
  }
})

watchDebounced(dragScrollIsActive, (value) => {
  if (!value) {
    emit('dragscrollendDelayed')
  }
}, { debounce: props.dragScrollEndDelayTimeout })

watch(bodyWidth, (value) => {
  emit('update:bodyWidth', value)
}, { immediate: true })

watch(bodyHeight, (value) => {
  emit('update:bodyHeight', value)
}, { immediate: true })

onMounted(() => {
  window.addEventListener('mouseup', mouseUpHandler, { passive: false })
  window.addEventListener('mousemove', mouseMoveHandler, { passive: false })
  window.addEventListener('touchend', mouseUpHandler, { passive: false })
  window.addEventListener('touchmove', mouseMoveHandler, { passive: false })
})

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', mouseUpHandler)
  window.removeEventListener('mousemove', mouseMoveHandler)
  window.removeEventListener('touchend', mouseUpHandler)
  window.removeEventListener('touchmove', mouseMoveHandler)
  preventTextSelection(false)
  preventNativeDragScroll(false)
  edgeTimeout.value && clearTimeout(edgeTimeout.value)
})
</script>
