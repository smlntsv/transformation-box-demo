import { SceneElement } from './scene-element.ts'
import type { ImageConfig } from '../../types/scene-config.ts'
import type { Vector2 } from '../vector2.ts'

class ImageSceneElement extends SceneElement {
  private readonly image: HTMLImageElement
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

  protected drawSelf(context: CanvasRenderingContext2D) {
    if (this.isImageLoaded) {
      context.drawImage(this.image, -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y)
    }
  }

  public contains(_point: Vector2): boolean {
    return false
  }
}

export { ImageSceneElement }
