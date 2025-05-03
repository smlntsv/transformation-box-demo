type PanningState = {
  active: boolean
  startX: number
  startY: number
}

type ClickHandler = (screenX: number, screenY: number) => boolean
type MoveHandler = ClickHandler
type PanningHandler = (screenDX: number, screenDY: number) => boolean
type ScrollHandler = (zoomDelta: number, screenX: number, screenY: number) => boolean

class InteractionManager {
  private canvas: HTMLCanvasElement
  private panningState: PanningState
  private readonly onMove: MoveHandler
  private readonly onClick: ClickHandler
  private readonly onPanning: PanningHandler
  private readonly onScroll: ScrollHandler
  private readonly isMacOS: boolean

  constructor(
    canvas: HTMLCanvasElement,
    onMove: MoveHandler,
    onClick: ClickHandler,
    onPanning: PanningHandler,
    onScroll: ScrollHandler
  ) {
    this.onPointerDown = this.onPointerDown.bind(this)
    this.onPointerUp = this.onPointerUp.bind(this)
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onWheel = this.onWheel.bind(this)

    this.canvas = canvas
    this.panningState = {
      active: false,
      startX: 0,
      startY: 0,
    }
    this.onMove = onMove
    this.onClick = onClick
    this.onPanning = onPanning
    this.onScroll = onScroll
    this.isMacOS = globalThis.navigator.userAgent.includes('Macintosh')

    this.attachEventListeners()
  }

  private onPointerDown(e: PointerEvent) {
    if (this.onClick(e.offsetX, e.offsetY)) {
      return
    }

    this.canvas.setPointerCapture(e.pointerId)

    this.panningState.active = true
    this.panningState.startX = e.clientX
    this.panningState.startY = e.clientY
  }

  private onPointerUp(e: PointerEvent) {
    this.canvas.releasePointerCapture(e.pointerId)

    this.panningState.active = false
  }

  private onPointerMove(e: PointerEvent) {
    if (this.panningState.active) {
      const dx = e.clientX - this.panningState.startX
      const dy = e.clientY - this.panningState.startY

      this.panningState.startX = e.clientX
      this.panningState.startY = e.clientY

      this.onPanning(dx, dy)
    } else {
      this.onMove(e.offsetX, e.offsetY)
    }
  }

  private onWheel(e: WheelEvent) {
    const deltaYFactor = this.isMacOS ? -1 : -3
    const delta =
      e.deltaMode === 1 || e.ctrlKey ? e.deltaY / deltaYFactor : e.deltaY / (deltaYFactor * 10)

    this.onScroll(delta, e.offsetX, e.offsetY)
  }

  private attachEventListeners() {
    this.canvas.addEventListener('pointerdown', this.onPointerDown)
    this.canvas.addEventListener('pointerup', this.onPointerUp)
    this.canvas.addEventListener('pointermove', this.onPointerMove)
    this.canvas.addEventListener('wheel', this.onWheel, { passive: true })
  }

  private detachEventListeners() {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown)
    this.canvas.removeEventListener('pointerup', this.onPointerUp)
    this.canvas.removeEventListener('pointermove', this.onPointerMove)
    this.canvas.removeEventListener('wheel', this.onWheel)
  }

  public destroy() {
    this.detachEventListeners()
  }
}

export { InteractionManager }
