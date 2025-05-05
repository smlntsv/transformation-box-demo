import type { BaseElementConfig, SceneConfig } from '../../types/scene-config.ts'

abstract class SceneElement {
  protected id: number
  protected position: DOMPoint
  protected size: DOMPoint
  protected rotation: number
  protected zIndex: number
  protected scale: DOMPoint
  protected _matrix: DOMMatrix
  protected matrixNeedsUpdate: boolean

  protected constructor(config: BaseElementConfig) {
    this.id = config.id
    this.position = new DOMPoint(config.position.x, config.position.y)
    this.size = new DOMPoint(config.size.x, config.size.y)
    this.scale = new DOMPoint(config.scale.x, config.scale.y)
    this.rotation = config.rotation
    this.zIndex = config.zIndex
    this._matrix = new DOMMatrix()
    this.matrixNeedsUpdate = true
  }

  public abstract toSceneConfig(): SceneConfig

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

    // top left, top right, bottom right, bottom left
    return [
      new DOMPoint(-halfWidth, -halfHeight),
      new DOMPoint(halfWidth, -halfHeight),
      new DOMPoint(halfWidth, halfHeight),
      new DOMPoint(-halfWidth, halfHeight),
    ]
  }

  public getPosition(): DOMPoint {
    return this.position
  }

  public setPosition(newPosition: DOMPoint): void {
    this.position = newPosition
    this.matrixNeedsUpdate = true
  }

  public getRotation(): number {
    return this.rotation
  }

  public getScale(): DOMPoint {
    return this.scale
  }

  public setScale(scale: DOMPoint): void {
    this.scale = scale
  }

  public getSize(): DOMPoint {
    return this.size
  }

  public setRotation(newRotation: number): void {
    this.rotation = newRotation
    this.matrixNeedsUpdate = true
  }

  protected toBaseElementConfig(): BaseElementConfig {
    return {
      id: this.id,
      position: this.position,
      size: this.size,
      scale: this.scale,
      rotation: this.rotation,
      zIndex: this.zIndex,
    }
  }
}

export { SceneElement }
