import type { SceneConfig } from '../types/scene-config.ts'

type HoverListener = (id: SceneConfig['id'] | null) => void
type SelectListener = HoverListener
type TransformListener = (config: SceneConfig) => void
type ZoomChangeListener = (zoom: number) => void

export enum SceneEvent {
  ElementHover,
  ElementSelect,
  ElementTransform,
  ZoomChange,
}

type SceneEventListeners = {
  [SceneEvent.ElementHover]: HoverListener
  [SceneEvent.ElementSelect]: SelectListener
  [SceneEvent.ElementTransform]: TransformListener
  [SceneEvent.ZoomChange]: ZoomChangeListener
}
export type SceneEventListener<T extends SceneEvent> = SceneEventListeners[T]

class SceneEventManager {
  private listeners: {
    [K in SceneEvent]: Set<SceneEventListeners[K]>
  }

  constructor() {
    this.listeners = {
      [SceneEvent.ElementHover]: new Set(),
      [SceneEvent.ElementSelect]: new Set(),
      [SceneEvent.ElementTransform]: new Set(),
      [SceneEvent.ZoomChange]: new Set(),
    }
  }

  public addEventListener<K extends SceneEvent>(type: K, listener: SceneEventListeners[K]): void {
    this.listeners[type].add(listener)
  }

  public removeEventListener<K extends SceneEvent>(
    type: K,
    listener: SceneEventListeners[K]
  ): void {
    this.listeners[type].delete(listener)
  }

  public notifyListeners<K extends SceneEvent>(
    type: K,
    ...args: Parameters<SceneEventListeners[K]>
  ) {
    this.listeners[type].forEach((listener) =>
      (listener as (...args: Parameters<SceneEventListeners[K]>) => void)(...args)
    )
  }
}

export { SceneEventManager }
