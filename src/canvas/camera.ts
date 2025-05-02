import { Vector2 } from './vector2.ts'

class Camera {
  private readonly position: Vector2
  private zoom: number
  private readonly rotation: number
  private readonly minZoom: number
  private readonly maxZoom: number

  constructor(
    position: Vector2 = new Vector2(0, 0),
    zoom: number = 1,
    minZoom: number = 0.1,
    maxZoom = 10
  ) {
    this.position = position
    this.zoom = zoom
    this.minZoom = minZoom
    this.maxZoom = maxZoom
    this.rotation = 0
  }

  public applyTransform(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.position.x, this.position.y)
    ctx.rotate(this.rotation)
    ctx.scale(this.zoom, this.zoom)
  }

  public moveBy(delta: Vector2) {
    this.position.x += delta.x
    this.position.y += delta.y
  }

  public getPosition(): Camera['position'] {
    return this.position
  }

  public getZoom(): Camera['zoom'] {
    return this.zoom
  }

  public setZoom(zoom: number) {
    this.zoom = zoom
  }

  public adjustZoomWithBounds(zoomDelta: number, screenX: number, screenY: number) {
    const currentZoom = this.zoom
    let nextZoom = currentZoom + zoomDelta / 40
    nextZoom = Math.max(this.minZoom, Math.min(nextZoom, this.maxZoom))

    if (nextZoom === currentZoom) {
      return
    }

    const worldX = (screenX - this.position.x) / currentZoom
    const worldY = (screenY - this.position.y) / currentZoom

    this.position.x = screenX - worldX * nextZoom
    this.position.y = screenY - worldY * nextZoom

    this.zoom = nextZoom
  }
}

export { Camera }
