import { Viewport } from './viewport.ts'
import { Camera } from './camera.ts'
import { InteractionManager } from './interaction-manager.ts'
import type { SceneConfig } from '../types/scene-config.ts'
import type { SceneElement } from './elements/scene-element.ts'
import { createSceneElement } from './elements/create-scene-element.ts'
import type { ArtboardResolution } from '../components/ArtboardResolutionSelect.vue'
import type { Zoom } from '../components/ZoomSelect.vue'
import { TransformationTool } from './transformation-tool.ts'
import { SceneEvent, type SceneEventListener, SceneEventManager } from './scene-event-manager.ts'

class PreviewCanvasManager {
  private readonly canvas: HTMLCanvasElement
  private readonly viewport: Viewport
  private readonly camera: Camera
  private interactionManager: InteractionManager
  private artboardResolution: ArtboardResolution
  private sceneElementEventManager: SceneEventManager

  private sceneElements: Map<SceneElement['id'], SceneElement>
  private selectedElement: SceneElement | null
  private hoveredElement: SceneElement | null
  private transformationTool: TransformationTool | null

  private readonly context: CanvasRenderingContext2D

  constructor(
    canvas: HTMLCanvasElement,
    initialArtboardResolution: ArtboardResolution,
    initialZoom: Zoom
  ) {
    this.onPointerDown = this.onPointerDown.bind(this)
    this.onPointerUp = this.onPointerUp.bind(this)
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onScroll = this.onScroll.bind(this)

    this.canvas = canvas
    this.viewport = new Viewport(this.canvas, this.render.bind(this))
    this.camera = new Camera(new DOMPoint(), initialZoom)
    this.interactionManager = new InteractionManager(
      this.canvas,
      this.onPointerDown,
      this.onPointerUp,
      this.onPointerMove,
      this.onScroll
    )
    this.artboardResolution = initialArtboardResolution
    this.sceneElementEventManager = new SceneEventManager()

    this.sceneElements = new Map()
    this.selectedElement = null
    this.hoveredElement = null
    this.transformationTool = null

    const context = this.canvas.getContext('2d')

    if (!context) {
      throw new Error('Failed to get canvas context.')
    }

    this.context = context
  }

  public addEventListener<T extends SceneEvent>(type: T, listener: SceneEventListener<T>) {
    this.sceneElementEventManager.addEventListener(type, listener)
  }

  public removeEventListener<T extends SceneEvent>(type: T, listener: SceneEventListener<T>) {
    this.sceneElementEventManager.removeEventListener(type, listener)
  }

  public notifyListeners<T extends SceneEvent>(
    type: T,
    ...args: Parameters<SceneEventListener<T>>
  ) {
    this.sceneElementEventManager.notifyListeners(type, ...args)
  }

  public onArtboardResolutionChange(artboardResolution: ArtboardResolution) {
    this.artboardResolution = artboardResolution
    this.render()
  }

  public onZoomChange(zoom: Zoom) {
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

    if (this.selectedElement) {
      this.transformationTool = new TransformationTool(
        this.selectedElement,
        this.viewport,
        this.camera
      )
    } else {
      this.transformationTool = null
    }

    this.render()
  }

  public destroy() {
    this.viewport.destroy()
    this.interactionManager.destroy()
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

    // Overlays hovered/selected/transformation tool in screen space
    if (this.hoveredElement) {
      this.drawOverlayForElement(this.hoveredElement, 'hovered')
    }

    if (this.selectedElement) {
      this.drawOverlayForElement(this.selectedElement, 'selected')
    }

    if (this.transformationTool) {
      this.transformationTool.draw(this.context)
    }
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

  private setCursor(cursor: string | null): void {
    this.canvas.style.cursor = cursor ?? 'default'
  }

  private onPointerMove(screenX: number, screenY: number): void {
    let cursor: string | null = null
    let isHandled: boolean = false
    let mustRender = false

    if (this.transformationTool) {
      isHandled = this.transformationTool.onPointerMove(screenX, screenY)
      cursor = this.transformationTool.getCursor()
      mustRender = true
    }

    if (!isHandled && this.camera.getIsPanning()) {
      this.camera.panTo(screenX, screenY)
      cursor = 'grabbing'
    }

    if (!isHandled && !cursor) {
      const hitSceneElement = this.hitTestScreenElements(screenX, screenY)
      this.notifyListeners(
        SceneEvent.ElementHover,
        hitSceneElement ? hitSceneElement.getId() : null
      )
      cursor = hitSceneElement ? 'pointer' : null
    }

    this.setCursor(cursor)

    if (isHandled || cursor || mustRender) {
      this.render()
    }
  }

  private onPointerDown(screenX: number, screenY: number): void {
    if (this.transformationTool?.onPointerDown(screenX, screenY)) {
      this.render()
      return
    }

    const hitSceneElement = this.hitTestScreenElements(screenX, screenY)
    this.notifyListeners(SceneEvent.ElementSelect, hitSceneElement ? hitSceneElement.getId() : null)
    if (hitSceneElement) {
      return
    }

    this.camera.beginPanning(screenX, screenY)
    this.render()
  }

  private onPointerUp(): void {
    if (this.transformationTool) {
      const transformedElement = this.transformationTool.getTransformedElement()
      if (transformedElement) {
        const sceneElementConfig = transformedElement.toSceneConfig()
        this.notifyListeners(SceneEvent.ElementTransform, sceneElementConfig)
      }

      this.transformationTool.onPointerUp()
      this.setCursor(null)
    }

    if (this.camera.getIsPanning()) {
      this.camera.endPanning()
      this.setCursor(null)
    }
  }

  private hitTestScreenElements(screenX: number, screenY: number): SceneElement | null {
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

  private onScroll(zoomDelta: number, screenX: number, screenY: number): void {
    this.camera.adjustZoomWithBounds(zoomDelta, screenX, screenY)
    const currentZoom = this.camera.getZoom()
    this.notifyListeners(SceneEvent.ZoomChange, currentZoom)
    this.render()
  }

  private drawArtboard() {
    this.context.save()

    this.context.fillStyle = '#6b7280'
    this.context.shadowColor = '#1f2937'
    this.context.shadowBlur = 20
    this.context.fillRect(0, 0, this.artboardResolution.width, this.artboardResolution.height)

    this.context.restore()
  }
}

export { SceneEvent }
export { PreviewCanvasManager }
