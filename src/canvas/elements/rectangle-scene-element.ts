import { SceneElement } from './scene-element.ts'
import type { RectangleConfig } from '../../types/scene-config.ts'
import type { Vector2 } from '../vector2.ts'
import { applyHoveredStyle, applySelectedStyle } from './draw-utils.ts'

class RectangleSceneElement extends SceneElement {
  private readonly color: string

  constructor(config: RectangleConfig) {
    super(config)
    this.color = config.color
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save()

    // transform

    ctx.fillStyle = this.color
    const topLeftX = this.x - this.width / 2
    const topLeftY = this.y - this.height / 2
    ctx.fillRect(topLeftX, topLeftY, this.width, this.height)

    if (this.isHovered) {
      applyHoveredStyle(ctx, topLeftX, topLeftY, this.width, this.height)
    }

    if (this.isSelected) {
      applySelectedStyle(ctx, topLeftX, topLeftY, this.width, this.height)
    }

    ctx.restore()
  }

  public contains(_point: Vector2): boolean {
    return false
  }
}

export { RectangleSceneElement }
