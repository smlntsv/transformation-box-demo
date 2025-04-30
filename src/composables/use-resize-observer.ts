import { onBeforeUnmount, type Ref } from 'vue'
import { ref, watch } from 'vue'
import { debounce } from '../utils/debounce.ts'

function useResizeObserver(elementRef: Ref<HTMLElement | null>): Ref<DOMRectReadOnly> {
  const contentRect = ref<DOMRectReadOnly>(new DOMRectReadOnly())
  let observer: ResizeObserver | null = null

  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  watch(
    elementRef,
    (newElementRef) => {
      cleanup()

      if (newElementRef) {
        observer = new ResizeObserver(
          debounce((entries: ResizeObserverEntry[]) => {
            if (entries.length) {
              contentRect.value = entries[0].contentRect
            }
          })
        )

        observer.observe(newElementRef)
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(cleanup)

  return contentRect
}

export { useResizeObserver }
