import { Vector2 } from './vector2.ts'

class Camera {
  private position: Vector2
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

  // TODO: improve
  public adjustZoomWithBounds(zoomDelta: number) {
    let nextZoom = this.zoom + zoomDelta

    if (nextZoom < this.minZoom) {
      nextZoom = this.minZoom
    } else if (nextZoom > this.maxZoom) {
      nextZoom = this.maxZoom
    }

    this.zoom = nextZoom
  }
}

export { Camera }
