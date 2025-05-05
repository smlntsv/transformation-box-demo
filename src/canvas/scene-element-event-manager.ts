import type { SceneConfig } from '../types/scene-config.ts'

type HoverListener = (id: SceneConfig['id'] | null) => void
type SelectListener = HoverListener
type TransformListener = (config: SceneConfig) => void

export enum SceneElementEvent {
  Hover,
  Select,
  Transform,
}

type SceneEventListeners = {
  [SceneElementEvent.Hover]: HoverListener
  [SceneElementEvent.Select]: SelectListener
  [SceneElementEvent.Transform]: TransformListener
}
export type SceneEventListener<T extends SceneElementEvent> = SceneEventListeners[T]

class SceneElementEventManager {
  private listeners: {
    [K in SceneElementEvent]: Set<SceneEventListeners[K]>
  }

  constructor() {
    this.listeners = {
      [SceneElementEvent.Hover]: new Set(),
      [SceneElementEvent.Select]: new Set(),
      [SceneElementEvent.Transform]: new Set(),
    }
  }

  public addEventListener<K extends SceneElementEvent>(
    type: K,
    listener: SceneEventListeners[K]
  ): void {
    this.listeners[type].add(listener)
  }

  public removeEventListener<K extends SceneElementEvent>(
    type: K,
    listener: SceneEventListeners[K]
  ): void {
    this.listeners[type].delete(listener)
  }

  public notifyListeners<K extends SceneElementEvent>(
    type: K,
    ...args: Parameters<SceneEventListeners[K]>
  ) {
    this.listeners[type].forEach((listener) =>
      (listener as (...args: Parameters<SceneEventListeners[K]>) => void)(...args)
    )
  }
}

export { SceneElementEventManager }
