import { debounce } from '../utils/debounce.ts'

class Viewport {
  private canvas: HTMLCanvasElement
  private observer: ResizeObserver | null = null
  private readonly dpr: number
  private readonly onResizeCallback?: () => void

  constructor(canvas: HTMLCanvasElement, onResizeCallback?: () => void) {
    this.onParentResize = this.onParentResize.bind(this)
    this.canvas = canvas
    this.dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1

    if (onResizeCallback) {
      this.onResizeCallback = onResizeCallback
    }

    const parentElement = this.canvas.parentElement

    if (parentElement) {
      this.observer = new ResizeObserver(
        debounce((entries: ResizeObserverEntry[]) => {
          if (entries.length) {
            this.onParentResize(entries[0].contentRect)

            if (this.onResizeCallback) {
              this.onResizeCallback()
            }
          }
        })
      )

      this.observer.observe(parentElement)
    }
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }

  public getScale(): number {
    return this.dpr
  }

  private onParentResize(parentContentRect: DOMRectReadOnly) {
    const width = Math.floor(parentContentRect.width)
    const height = Math.floor(parentContentRect.height)
    this.canvas.width = width * this.dpr
    this.canvas.height = height * this.dpr
    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'
  }
}

export { Viewport }
