import { SceneElement } from './scene-element.ts'
import type { RectangleConfig } from '../../types/scene-config.ts'
import type { Vector2 } from '../vector2.ts'

class RectangleSceneElement extends SceneElement {
  private readonly color: string

  constructor(config: RectangleConfig) {
    super(config)
    this.color = config.color
  }

  protected drawSelf(context: CanvasRenderingContext2D) {
    context.fillStyle = this.color
    context.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y)
  }

  public contains(_point: Vector2): boolean {
    return false
  }
}

export { RectangleSceneElement }
