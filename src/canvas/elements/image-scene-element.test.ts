import { describe, expect, it } from 'vitest'
import {
  createImageSceneConfig,
  mockCanvasRenderingContext2D,
} from './scene-elements.test.helpers.ts'
import { ImageSceneElement } from './image-scene-element.ts'

describe('ImageSceneElement', () => {
  it('toSceneConfig() returns correct config', () => {
    const imageConfig = createImageSceneConfig()
    const imageElement = new ImageSceneElement(imageConfig)
    expect(imageElement.toSceneConfig()).toMatchObject(imageConfig)
  })

  it('drawSelf does not draw if image not loaded', () => {
    const context = mockCanvasRenderingContext2D()
    const imageElement = new ImageSceneElement(createImageSceneConfig())
    imageElement['isImageLoaded'] = false
    imageElement.draw(context)
    expect(context.drawImage).not.toHaveBeenCalled()
  })

  it('drawSelf does draw when image is loaded', () => {
    const context = mockCanvasRenderingContext2D()
    const imageElement = new ImageSceneElement(createImageSceneConfig())
    imageElement['isImageLoaded'] = true
    imageElement.draw(context)
    expect(context.drawImage).toHaveBeenCalled()
  })

  it('sets isImageLoaded to true when image loads', () => {
    const imageElement = new ImageSceneElement(createImageSceneConfig())
    expect(imageElement['isImageLoaded']).toBe(false)
    imageElement['image'].onload!(new Event('load'))
    expect(imageElement['isImageLoaded']).toBe(true)
  })
})
