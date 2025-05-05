import type { SceneElement } from './scene-element.ts'
import type { SceneConfig } from '../../types/scene-config.ts'
import { RectangleSceneElement } from './rectangle-scene-element.ts'
import { ImageSceneElement } from './image-scene-element.ts'

function createSceneElement(config: SceneConfig): SceneElement {
  switch (config.type) {
    case 'rectangle':
      return new RectangleSceneElement(config)
    case 'image':
      return new ImageSceneElement(config)
    default:
      throw new Error('SceneElement is not supported.')
  }
}

export { createSceneElement }
