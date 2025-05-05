import { vi } from 'vitest'
import type { BaseElementConfig, ImageConfig, RectangleConfig } from '../../types/scene-config.ts'

function mockCanvasRenderingContext2D() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    transform: vi.fn(),
    fillStyle: '',
    fillRect: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

function createBaseElementConfigObject(
  override: Partial<BaseElementConfig> = {}
): BaseElementConfig {
  return {
    id: 0,
    position: { x: 0, y: 0 },
    size: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    zIndex: 0,
    ...override,
  }
}

function createRectangleSceneConfig(override: Partial<RectangleConfig> = {}): RectangleConfig {
  return {
    ...createBaseElementConfigObject(),
    type: 'rectangle',
    color: 'white',
    ...override,
  }
}

function createImageSceneConfig(override: Partial<ImageConfig> = {}): ImageConfig {
  return {
    ...createBaseElementConfigObject(),
    type: 'image',
    src: 'image-src',
    ...override,
  }
}

export {
  mockCanvasRenderingContext2D,
  createBaseElementConfigObject,
  createRectangleSceneConfig,
  createImageSceneConfig,
}
