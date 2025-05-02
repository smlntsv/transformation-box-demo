type Point = { x: number; y: number }

type BaseElementConfig = {
  id: number
  position: Point
  size: Point
  scale: Point
  rotation: number
  zIndex: number
}

type RectangleConfig = BaseElementConfig & {
  type: 'rectangle'
  color: string
}

type ImageConfig = BaseElementConfig & {
  type: 'image'
  src: string
}

type SceneConfig = RectangleConfig | ImageConfig

export type { SceneConfig, BaseElementConfig, RectangleConfig, ImageConfig }
