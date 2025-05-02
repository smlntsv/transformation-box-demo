import type { BaseElementConfig } from '../../types/scene-config.ts'
import type { Vector2 } from '../vector2.ts'

abstract class SceneElement {
  protected id: number
  protected x: number
  protected y: number
  protected width: number
  protected height: number
  protected zIndex: number
  protected isSelected: boolean
  protected isHovered: boolean

  protected constructor(config: BaseElementConfig) {
    this.id = config.id
    this.x = config.x
    this.y = config.y
    this.width = config.width
    this.height = config.height
    this.zIndex = config.zIndex
    this.isSelected = false
    this.isHovered = false
  }

  abstract draw(context: CanvasRenderingContext2D): void

  abstract contains(point: Vector2): boolean

  public getId(): SceneElement['id'] {
    return this.id
  }

  public getZIndex(): SceneElement['zIndex'] {
    return this.zIndex
  }

  public getIsSelected(): SceneElement['isSelected'] {
    return this.isSelected
  }

  public setIsSelected(isSelected: boolean): void {
    this.isSelected = isSelected
  }

  public getIsHovered(): SceneElement['isHovered'] {
    return this.isHovered
  }

  public setIsHovered(isHovered: boolean): void {
    this.isHovered = isHovered
  }
}

export { SceneElement }
