import { SceneElement } from './scene-element.ts'
import type { ImageConfig } from '../../types/scene-config.ts'
import type { Vector2 } from '../vector2.ts'
import { applyHoveredStyle, applySelectedStyle } from './draw-utils.ts'

class ImageSceneElement extends SceneElement {
  private image: HTMLImageElement
  private isImageLoaded: boolean

  constructor(config: ImageConfig) {
    super(config)
    this.image = new Image()
    this.isImageLoaded = false
    this.image.onload = () => {
      this.isImageLoaded = true
    }
    this.image.src = config.src
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save()

    if (this.isImageLoaded) {
      // transform

      const topLeftX = this.x - this.width / 2
      const topLeftY = this.y - this.height / 2
      ctx.drawImage(this.image, topLeftX, topLeftY, this.width, this.height)

      if (this.isHovered) {
        applyHoveredStyle(ctx, topLeftX, topLeftY, this.width, this.height)
      }

      if (this.isSelected) {
        applySelectedStyle(ctx, topLeftX, topLeftY, this.width, this.height)
      }
    }

    ctx.restore()
  }

  public contains(_point: Vector2): boolean {
    return false
  }
}

export { ImageSceneElement }
