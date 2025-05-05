import { describe, it, expect } from 'vitest'
import { createSceneElement } from './create-scene-element.ts'
import type { SceneConfig } from '../../types/scene-config.ts'
import { ImageSceneElement } from './image-scene-element.ts'
import { RectangleSceneElement } from './rectangle-scene-element.ts'
import {
  createBaseElementConfigObject,
  createImageSceneConfig,
  createRectangleSceneConfig,
} from './scene-elements.test.helpers.ts'

describe('createSceneElement function', () => {
  it('create RectangleSceneElement instance for type: rectangle', () => {
    const rectangleConfig = createRectangleSceneConfig()
    const rectangleElement = createSceneElement(rectangleConfig)
    expect(rectangleElement).toBeInstanceOf(RectangleSceneElement)
  })

  it('creates ImageSceneElement for type: image', () => {
    const imageConfig = createImageSceneConfig()
    const imageElement = createSceneElement(imageConfig)
    expect(imageElement).toBeInstanceOf(ImageSceneElement)
  })

  it('throws an error if type is not supported', () => {
    const config = {
      ...createBaseElementConfigObject(),
      type: 'unsupported-type',
    } as unknown as SceneConfig

    expect(() => createSceneElement(config)).toThrowError('SceneElement is not supported.')
  })
})
