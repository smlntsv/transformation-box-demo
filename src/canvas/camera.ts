class Camera {
  private readonly position: DOMPoint
  private zoom: number
  private readonly rotation: number
  private readonly minZoom: number
  private readonly maxZoom: number
  private _matrix: DOMMatrix
  private matrixNeedsUpdate: boolean
  private isPanning: boolean
  private lastPointerPosition: DOMPoint | null

  constructor(
    position: DOMPoint = new DOMPoint(),
    zoom: number = 1,
    minZoom: number = 0.1,
    maxZoom = 10
  ) {
    this.position = position
    this.zoom = zoom
    this.minZoom = minZoom
    this.maxZoom = maxZoom
    this.rotation = 0
    this._matrix = new DOMMatrix()
    this.matrixNeedsUpdate = true
    this.isPanning = false
    this.lastPointerPosition = null
  }

  public getIsPanning(): boolean {
    return this.isPanning
  }

  public beginPanning(screenX: number, screenY: number): void {
    this.lastPointerPosition = new DOMPoint(screenX, screenY)
    this.isPanning = true
  }

  public endPanning(): void {
    this.lastPointerPosition = null
    this.isPanning = false
  }

  public panTo(screenX: number, screenY: number): void {
    if (!this.isPanning || !this.lastPointerPosition) {
      return
    }

    const dx = screenX - this.lastPointerPosition.x
    const dy = screenY - this.lastPointerPosition.y

    this.moveBy(new DOMPoint(dx, dy))
    this.lastPointerPosition = new DOMPoint(screenX, screenY)
  }

  public get matrix(): DOMMatrix {
    if (this.matrixNeedsUpdate) {
      this._matrix = new DOMMatrix()
        .translateSelf(this.position.x, this.position.y)
        .rotateSelf(0, 0, this.rotation)
        .scaleSelf(this.zoom, this.zoom)

      this.matrixNeedsUpdate = false
    }

    return this._matrix
  }

  public moveBy(delta: DOMPoint) {
    this.position.x += delta.x
    this.position.y += delta.y
    this.matrixNeedsUpdate = true
  }

  public getPosition(): Camera['position'] {
    return this.position
  }

  public getZoom(): Camera['zoom'] {
    return this.zoom
  }

  public setZoom(zoom: number) {
    this.zoom = zoom
    this.matrixNeedsUpdate = true
  }

  public adjustZoomWithBounds(zoomDelta: number, screenX: number, screenY: number) {
    const currentZoom = this.zoom
    let nextZoom = currentZoom + zoomDelta / 40
    nextZoom = Math.max(this.minZoom, Math.min(nextZoom, this.maxZoom))

    if (nextZoom === currentZoom) {
      return
    }

    const screenPoint = new DOMPoint(screenX, screenY)
    const inverseMatrix = this._matrix.inverse()
    const worldPoint = screenPoint.matrixTransform(inverseMatrix)

    this.position.x = screenX - worldPoint.x * nextZoom
    this.position.y = screenY - worldPoint.y * nextZoom

    this.zoom = nextZoom
    this.matrixNeedsUpdate = true
  }
}

export { Camera }
