import { SceneElement } from './scene-element.ts'
import type { ImageConfig } from '../../types/scene-config.ts'

class ImageSceneElement extends SceneElement {
  private readonly src: string
  private readonly image: HTMLImageElement
  private isImageLoaded: boolean

  constructor(config: ImageConfig) {
    super(config)
    this.src = config.src
    this.image = new Image()
    this.isImageLoaded = false
    this.image.onload = () => {
      this.isImageLoaded = true
    }
    this.image.src = config.src
  }

  public toSceneConfig(): ImageConfig {
    return {
      ...this.toBaseElementConfig(),
      type: 'image',
      src: this.src,
    }
  }

  protected drawSelf(context: CanvasRenderingContext2D) {
    if (this.isImageLoaded) {
      context.drawImage(this.image, -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y)
    }
  }
}

export { ImageSceneElement }
