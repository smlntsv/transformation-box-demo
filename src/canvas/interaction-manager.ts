type PointerDownHandler = (screenX: number, screenY: number) => void
type PointerUpHandler = () => void
type PointerMove = (screenX: number, screenY: number) => void
type ScrollHandler = (zoomDelta: number, screenX: number, screenY: number) => void

class InteractionManager {
  private canvas: HTMLCanvasElement
  private readonly onPointerDown: PointerDownHandler
  private readonly onPointerUp: PointerUpHandler
  private readonly onPointerMove: PointerMove
  private readonly onWheel: ScrollHandler
  private readonly isMacOS: boolean

  constructor(
    canvas: HTMLCanvasElement,
    onPointerDown: PointerDownHandler,
    onPointerUp: PointerUpHandler,
    onPointerMove: PointerMove,
    onScroll: ScrollHandler
  ) {
    this._onPointerDown = this._onPointerDown.bind(this)
    this._onPointerUp = this._onPointerUp.bind(this)
    this._onPointerMove = this._onPointerMove.bind(this)
    this._onWheel = this._onWheel.bind(this)

    this.canvas = canvas
    this.onPointerDown = onPointerDown
    this.onPointerUp = onPointerUp
    this.onPointerMove = onPointerMove
    this.onWheel = onScroll
    this.isMacOS = globalThis.navigator.userAgent.includes('Macintosh')

    this.attachEventListeners()
  }

  private _onPointerDown(e: PointerEvent) {
    this.canvas.setPointerCapture(e.pointerId)
    this.onPointerDown(e.offsetX, e.offsetY)
  }

  private _onPointerUp(e: PointerEvent) {
    this.canvas.releasePointerCapture(e.pointerId)
    this.onPointerUp()
  }

  private _onPointerMove(e: PointerEvent) {
    this.onPointerMove(e.offsetX, e.offsetY)
  }

  private _onWheel(e: WheelEvent) {
    const deltaYFactor = this.isMacOS ? -1 : -3
    const delta =
      e.deltaMode === 1 || e.ctrlKey ? e.deltaY / deltaYFactor : e.deltaY / (deltaYFactor * 10)

    this.onWheel(delta, e.offsetX, e.offsetY)
  }

  private attachEventListeners() {
    this.canvas.addEventListener('pointerdown', this._onPointerDown)
    this.canvas.addEventListener('pointerup', this._onPointerUp)
    this.canvas.addEventListener('pointermove', this._onPointerMove)
    this.canvas.addEventListener('wheel', this._onWheel, { passive: true })
  }

  private detachEventListeners() {
    this.canvas.removeEventListener('pointerdown', this._onPointerDown)
    this.canvas.removeEventListener('pointerup', this._onPointerUp)
    this.canvas.removeEventListener('pointermove', this._onPointerMove)
    this.canvas.removeEventListener('wheel', this._onWheel)
  }

  public destroy() {
    this.detachEventListeners()
  }
}

export { InteractionManager }
