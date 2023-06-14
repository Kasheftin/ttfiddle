import { useLocalStorage } from '@vueuse/core'
import { sizes } from '@/constants/sizes'
import { useDrag } from './drag'

export const useLayoutResize = () => {
  const codeWidth = useLocalStorage('codeWidth', sizes.codeWidth)
  const formWidth = useLocalStorage('formWidth', sizes.formWidth)

  const { valueImmediate: codeWidthImmediate, dragStart: codeDragStart } = useDrag({ value: codeWidth, direction: 'horizontal', min: sizes.codeWidthMin })
  const { valueImmediate: formWidthImmediate, dragStart: formDragStart } = useDrag({ value: formWidth, direction: 'horizontal', min: sizes.formWidthMin })

  const dragstart = (target: 'code' | 'form', e: UIEvent) => {
    if (target === 'code') {
      codeDragStart(e)
    } else {
      formDragStart(e)
    }
  }
  return { codeWidth: codeWidthImmediate, formWidth: formWidthImmediate, dragstart }
}
