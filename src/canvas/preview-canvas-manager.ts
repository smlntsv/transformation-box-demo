import { Vector2 } from './vector2.ts'
import { Viewport } from './viewport.ts'
import { Camera } from './camera.ts'
import { InteractionManager } from './interaction-manager.ts'
import type { SceneConfig } from '../types/scene-config.ts'
import type { SceneElement } from './elements/scene-element.ts'
import { createSceneElement } from './create-scene-element.ts'
import type { Resolution } from '../components/ResolutionSelect.vue'
import type { Zoom } from '../components/ZoomSelect.vue'

export type SceneElementEventListener = (id: SceneElement['id'] | null) => void
export enum SceneElementEvent {
  Hover,
  Select,
}

class PreviewCanvasManager {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D
  private viewport: Viewport
  private camera: Camera
  private interactionManager: InteractionManager
  private artboardResolution: Resolution
  private readonly elementHoverListeners: Set<SceneElementEventListener>
  private readonly elementSelectListeners: Set<SceneElementEventListener>

  // TODO: move to the Scene class?
  private sceneElements: Map<SceneElement['id'], SceneElement>
  private selectedElement: SceneElement | null
  private hoveredElement: SceneElement | null

  constructor(canvas: HTMLCanvasElement) {
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onClick = this.onClick.bind(this)
    this.onPanning = this.onPanning.bind(this)
    this.onScroll = this.onScroll.bind(this)

    this.canvas = canvas
    this.viewport = new Viewport(this.canvas, this.render.bind(this))
    this.camera = new Camera(new Vector2(0, 0), 1) // TODO: set actual value
    this.interactionManager = new InteractionManager(
      this.canvas,
      this.onPointerMove,
      this.onClick,
      this.onPanning,
      this.onScroll
    )
    this.sceneElements = new Map()
    this.selectedElement = null
    this.hoveredElement = null
    this.artboardResolution = { width: 0, height: 0 } // TODO: set actual value
    this.elementHoverListeners = new Set()
    this.elementSelectListeners = new Set()
    const context = this.canvas.getContext('2d')

    if (!context) {
      throw new Error('Failed to get canvas context.')
    }

    this.context = context
  }

  public addEventListener(type: SceneElementEvent, listener: SceneElementEventListener) {
    if (type === SceneElementEvent.Hover) this.elementHoverListeners.add(listener)
    if (type === SceneElementEvent.Select) this.elementSelectListeners.add(listener)
  }

  public removeEventListener(type: SceneElementEvent, listener: SceneElementEventListener) {
    if (type === SceneElementEvent.Hover) this.elementHoverListeners.delete(listener)
    if (type === SceneElementEvent.Select) this.elementSelectListeners.delete(listener)
  }

  private notifyElementHover(id: SceneElement['id'] | null) {
    for (const hoverListener of this.elementHoverListeners) {
      hoverListener(id)
    }
  }

  private notifyElementSelect(id: SceneElement['id'] | null) {
    for (const selectListener of this.elementSelectListeners) {
      selectListener(id)
    }
  }

  public onResolutionChange(resolution: Resolution) {
    this.artboardResolution = resolution
    this.render()
  }

  public onZoomChange(zoom: Zoom) {
    // TODO: set zoom
    // TODO: align artboard in the center of the screen
    this.camera.setZoom(zoom)
    this.render()
  }

  public onElementsChange(sceneConfig: SceneConfig[]) {
    // TODO: optimize with something like reconciliation
    const sceneElements: Map<SceneElement['id'], SceneElement> = new Map()

    for (const configElement of sceneConfig) {
      const sceneElement = createSceneElement(configElement)
      sceneElements.set(sceneElement['id'], sceneElement)
    }

    this.sceneElements = sceneElements

    this.render()
  }

  public onHoverElement(id: SceneConfig['id'] | null) {
    if (!id) {
      this.hoveredElement = null
    } else {
      this.hoveredElement = this.sceneElements.get(id) ?? null
    }

    this.render()
  }

  public onSelectElement(id: SceneConfig['id'] | null) {
    if (!id) {
      this.selectedElement = null
    } else {
      this.selectedElement = this.sceneElements.get(id) ?? null
    }

    this.render()
  }

  public destroy() {
    this.viewport.destroy()
    this.interactionManager.destroy()
    this.elementHoverListeners.clear()
    this.elementSelectListeners.clear()
  }

  public render() {
    this.context.resetTransform()
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const scale = this.viewport.getScale()
    this.context.scale(scale, scale)

    const { a, b, c, d, e, f } = this.camera.matrix
    this.context.transform(a, b, c, d, e, f)

    // Artboard
    this.drawArtboard()

    // Scene elements
    const elementsToRender: SceneElement[] = Array.from(this.sceneElements.values()).sort(
      (a, b) => a.getZIndex() - b.getZIndex()
    )
    for (const element of elementsToRender) {
      element.draw(this.context)
    }

    // Overlays in screen space
    if (this.hoveredElement) {
      this.drawOverlayForElement(this.hoveredElement, 'hovered')
    }

    if (this.selectedElement) {
      this.drawOverlayForElement(this.selectedElement, 'selected')
    }

    // Transformation tool

    // Debug elements
    this.context.save()
    this.context.fillStyle = 'white'
    this.context.fillRect(0, 0, 10, 10)

    this.renderCameraDebugInfo()
  }

  private drawOverlayForElement(element: SceneElement, type: 'hovered' | 'selected') {
    const overlayStyles = {
      hovered: { lineWidth: 1, lineDash: [4, 4], strokeStyle: 'white' },
      selected: { lineWidth: 2, lineDash: [], strokeStyle: 'white' },
    }

    this.context.save()

    // Viewport transformation
    this.context.resetTransform()
    const scale = this.viewport.getScale()
    this.context.scale(scale, scale)

    // Camera + SceneElement transformations
    const screenMatrix = this.camera.matrix.multiply(element.matrix)
    const corners = element.getLocalCorners().map((point) => point.matrixTransform(screenMatrix))

    // Style
    const style = overlayStyles[type]
    this.context.lineWidth = style.lineWidth
    this.context.lineCap = 'round'
    this.context.setLineDash(style.lineDash)
    this.context.strokeStyle = style.strokeStyle

    // Draw
    this.context.beginPath()
    for (let i = 0; i < corners.length; i++) {
      if (i === 0) {
        this.context.moveTo(corners[i].x, corners[i].y)
      } else {
        this.context.lineTo(corners[i].x, corners[i].y)
      }
    }
    this.context.closePath()
    this.context.stroke()

    this.context.restore()
  }

  private renderCameraDebugInfo() {
    this.context.save()
    this.context.resetTransform()
    this.context.getTransform().toString()
    this.context.shadowColor = 'black'
    this.context.shadowOffsetX = 0
    this.context.shadowOffsetY = 0
    this.context.shadowBlur = 20
    this.context.fillStyle = 'white'
    this.context.font = '28px monospace'
    const cameraPosition = this.camera.getPosition()
    const cameraZoom = this.camera.getZoom()
    this.context.fillText(
      `x: ${Math.floor(cameraPosition.x)}, y: ${Math.floor(cameraPosition.y)}, zoom: ${Math.floor(cameraZoom * 100) / 100}`,
      20,
      40
    )

    this.context.restore()
  }

  private onPointerMove(screenX: number, screenY: number) {
    const hitElement = this.hitTest(screenX, screenY)
    this.notifyElementHover(hitElement ? hitElement.getId() : null)

    return Boolean(hitElement)
  }

  private onClick(screenX: number, screenY: number): boolean {
    const hitElement = this.hitTest(screenX, screenY)
    this.notifyElementSelect(hitElement ? hitElement.getId() : null)

    return Boolean(hitElement)
  }

  private hitTest(screenX: number, screenY: number): SceneElement | null {
    const screenPoint = new DOMPoint(screenX, screenY)
    const inverseMatrix = this.camera.matrix.inverse()
    const worldPoint = screenPoint.matrixTransform(inverseMatrix)

    const sceneElementsSortedDesc: SceneElement[] = Array.from(this.sceneElements.values()).sort(
      (a, b) => b.getZIndex() - a.getZIndex()
    )

    for (const sceneElement of sceneElementsSortedDesc) {
      if (sceneElement.contains(worldPoint.x, worldPoint.y)) {
        return sceneElement
      }
    }

    return null
  }

  private onPanning(screenDX: number, screenDY: number): boolean {
    this.camera.moveBy(new Vector2(screenDX, screenDY))
    this.render()

    return true
  }

  private onScroll(zoomDelta: number, screenX: number, screenY: number): boolean {
    this.camera.adjustZoomWithBounds(zoomDelta, screenX, screenY)
    this.render()

    return true
  }

  private drawArtboard() {
    // TODO: check value on init
    if (this.artboardResolution) {
      this.context.save()

      this.context.fillStyle = '#6b7280'
      this.context.shadowColor = '#1f2937'
      this.context.shadowBlur = 20
      this.context.fillRect(0, 0, this.artboardResolution.width, this.artboardResolution.height)

      this.context.restore()
    }
  }
}

export { PreviewCanvasManager }
