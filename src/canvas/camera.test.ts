import { describe, it, expect, beforeEach } from 'vitest'
import { Camera } from './camera.ts'

const defaults = {
  position: new DOMPoint(),
  zoom: 1,
  minZoom: 0.1,
  maxZoom: 10,
}

describe('Camera class', () => {
  let camera: Camera

  beforeEach(() => {
    camera = new Camera()
  })

  it('constructs with expected defaults', () => {
    const position = camera.getPosition()

    expect(position.x).toBe(defaults.position.x)
    expect(position.y).toBe(defaults.position.x)
    expect(camera.getZoom()).toBe(defaults.zoom)
  })

  it('panning works correctly', () => {
    camera.beginPanning(100, 200)
    expect(camera.getIsPanning()).toBe(true)

    camera.panTo(300, 400)
    let position = camera.getPosition()
    expect(position.x).toBe(200)
    expect(position.y).toBe(200)

    camera.endPanning()
    expect(camera.getIsPanning()).toBe(false)

    camera.panTo(200, 200)
    position = camera.getPosition()
    expect(position.x).toBe(200)
    expect(position.y).toBe(200)
  })

  it('zooms with bounds', () => {
    camera.setZoom(1)
    camera.adjustZoomWithBounds(-1000, 0, 0)
    expect(camera.getZoom()).toBe(defaults.minZoom)

    camera.adjustZoomWithBounds(1000, 0, 0)
    expect(camera.getZoom()).toBe(defaults.maxZoom)

    camera.adjustZoomWithBounds(0, 0, 0)
    expect(camera.getZoom()).toBe(defaults.maxZoom)
  })

  it('moveBy changes position', () => {
    camera.moveBy(new DOMPoint(40, 80))
    const position = camera.getPosition()
    expect(position.x).toBe(40)
    expect(position.y).toBe(80)
  })

  it('should provide transformation matrix', () => {
    const moveByDelta = new DOMPoint(100, 200)
    camera.moveBy(moveByDelta)
    const { a, b, c, d, e, f } = camera.matrix

    expect(a).toBe(1)
    expect(b).toBe(0)
    expect(c).toBe(0)
    expect(d).toBe(1)
    expect(e).toBe(moveByDelta.x)
    expect(f).toBe(moveByDelta.y)
  })
})
