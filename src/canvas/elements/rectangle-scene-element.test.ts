import { describe, expect, it } from 'vitest'
import {
  createRectangleSceneConfig,
  mockCanvasRenderingContext2D,
} from './scene-elements.test.helpers.ts'
import { RectangleSceneElement } from './rectangle-scene-element.ts'

describe('RectangleSceneElement class', () => {
  it('position management works', () => {
    const rectangleElement = new RectangleSceneElement(
      createRectangleSceneConfig({ position: { x: 234, y: 543 } })
    )

    let position = rectangleElement.getPosition()
    expect(position.x).toBe(234)
    expect(position.y).toBe(543)

    rectangleElement.setPosition(new DOMPoint(543, 123))
    position = rectangleElement.getPosition()
    expect(position.x).toBe(543)
    expect(position.y).toBe(123)
  })

  it('size management works', () => {
    const rectangleElement = new RectangleSceneElement(
      createRectangleSceneConfig({ size: { x: 432, y: 234 } })
    )

    const size = rectangleElement.getSize()
    expect(size.x).toBe(432)
    expect(size.y).toBe(234)
  })

  it('returns id', () => {
    const rectangleElement = new RectangleSceneElement(createRectangleSceneConfig({ id: 234 }))
    expect(rectangleElement.getId()).toBe(234)
  })

  it('returns zIndex', () => {
    const rectangleElement = new RectangleSceneElement(createRectangleSceneConfig({ zIndex: 1 }))
    expect(rectangleElement.getZIndex()).toBe(1)
  })

  it('scale management works', () => {
    const rectangleElement = new RectangleSceneElement(
      createRectangleSceneConfig({ scale: { x: 234, y: 543 } })
    )

    let scale = rectangleElement.getScale()
    expect(scale.x).toBe(234)
    expect(scale.y).toBe(543)

    rectangleElement.setScale(new DOMPoint(1, 2))
    scale = rectangleElement.getScale()
    expect(scale.x).toBe(1)
    expect(scale.y).toBe(2)
  })

  it('rotation management works', () => {
    const rectangleElement = new RectangleSceneElement(createRectangleSceneConfig({ rotation: 45 }))
    expect(rectangleElement.getRotation()).toBe(45)

    rectangleElement.setRotation(100)
    expect(rectangleElement.getRotation()).toBe(100)
  })

  it('correctly returns local corner coordinates', () => {
    const rectangleElement = new RectangleSceneElement(
      createRectangleSceneConfig({
        size: { x: 100, y: 100 },
      })
    )

    const corners = rectangleElement.getLocalCorners()
    expect(corners[0].x).toBe(-50)
    expect(corners[0].y).toBe(-50)
    expect(corners[1].x).toBe(50)
    expect(corners[1].y).toBe(-50)
    expect(corners[2].x).toBe(50)
    expect(corners[2].y).toBe(50)
    expect(corners[3].x).toBe(-50)
    expect(corners[3].y).toBe(50)
  })

  it('correctly checks if point within rectangle', () => {
    const rectangleElement = new RectangleSceneElement(
      createRectangleSceneConfig({
        size: { x: 100, y: 100 },
      })
    )

    expect(rectangleElement.contains(0, 0)).toBe(true)
    expect(rectangleElement.contains(51, 0)).toBe(false)
  })

  it('matrix updates on position change', () => {
    const rectangleElement = new RectangleSceneElement(createRectangleSceneConfig())
    rectangleElement.setPosition(new DOMPoint(543, 234))
    expect(rectangleElement.matrix.e).toBe(543)
    expect(rectangleElement.matrix.f).toBe(234)
  })

  it('draw calls drawSelf', () => {
    const context = mockCanvasRenderingContext2D()
    const rectangleElement = new RectangleSceneElement(createRectangleSceneConfig())
    rectangleElement.draw(context)

    expect(context.save).toHaveBeenCalled()
    expect(context.transform).toHaveBeenCalled()
    expect(context.fillRect).toHaveBeenCalled()
    expect(context.restore).toHaveBeenCalled()
  })

  it('toSceneConfig() returns correct config', () => {
    const rectangleConfig = createRectangleSceneConfig({ color: 'blue' })
    const rectangleElement = new RectangleSceneElement(rectangleConfig)
    expect(rectangleElement.toSceneConfig()).toMatchObject(rectangleConfig)
  })
})
