type BaseElementConfig = {
  id: number
  x: number
  y: number
  width: number
  height: number
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

export type { SceneConfig }
