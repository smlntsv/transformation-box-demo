import { SceneElement } from './scene-element.ts'
import type { RectangleConfig } from '../../types/scene-config.ts'

class RectangleSceneElement extends SceneElement {
  private readonly color: string

  constructor(config: RectangleConfig) {
    super(config)
    this.color = config.color
  }

  public toSceneConfig(): RectangleConfig {
    return {
      ...this.toBaseElementConfig(),
      type: 'rectangle',
      color: this.color,
    }
  }

  protected drawSelf(context: CanvasRenderingContext2D) {
    context.fillStyle = this.color
    context.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y)
  }
}

export { RectangleSceneElement }
