import type { BaseElementConfig } from '../../types/scene-config.ts'
import { Vector2 } from '../vector2.ts'

abstract class SceneElement {
  protected id: number
  protected position: Vector2
  protected size: Vector2
  protected rotation: number
  protected zIndex: number
  protected scale: Vector2
  protected _matrix: DOMMatrix
  protected matrixNeedsUpdate: boolean

  protected constructor(config: BaseElementConfig) {
    this.id = config.id
    this.position = new Vector2(config.position.x, config.position.y)
    this.size = new Vector2(config.size.x, config.size.y)
    this.scale = new Vector2(config.scale.x, config.scale.y)
    this.rotation = config.rotation
    this.zIndex = config.zIndex
    this._matrix = new DOMMatrix()
    this.matrixNeedsUpdate = true
  }

  protected abstract drawSelf(context: CanvasRenderingContext2D): void

  public draw(context: CanvasRenderingContext2D) {
    context.save()

    const { a, b, c, d, e, f } = this.matrix
    context.transform(a, b, c, d, e, f)

    this.drawSelf(context)

    context.restore()
  }

  public contains(worldX: number, worldY: number): boolean {
    const worldPoint = new DOMPoint(worldX, worldY)
    const inverseMatrix = this.matrix.inverse()
    const localPoint = worldPoint.matrixTransform(inverseMatrix)

    return (
      localPoint.x >= -this.size.x / 2 &&
      localPoint.x <= this.size.x / 2 &&
      localPoint.y >= -this.size.y / 2 &&
      localPoint.y <= this.size.y / 2
    )
  }

  public get matrix(): DOMMatrix {
    if (this.matrixNeedsUpdate) {
      this._matrix = new DOMMatrix()
        .translateSelf(this.position.x, this.position.y)
        .rotateSelf(0, 0, this.rotation)
        .scaleSelf(this.scale.x, this.scale.y)

      this.matrixNeedsUpdate = false
    }

    return this._matrix
  }

  public getId(): SceneElement['id'] {
    return this.id
  }

  public getZIndex(): SceneElement['zIndex'] {
    return this.zIndex
  }

  public getLocalCorners(): DOMPoint[] {
    const halfWidth = this.size.x / 2
    const halfHeight = this.size.y / 2

    return [
      new DOMPoint(-halfWidth, halfHeight),
      new DOMPoint(halfWidth, halfHeight),
      new DOMPoint(halfWidth, -halfHeight),
      new DOMPoint(-halfWidth, -halfHeight),
    ]
  }
}

export { SceneElement }
