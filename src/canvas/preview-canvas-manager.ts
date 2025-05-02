import { Vector2 } from './vector2.ts'
import { Viewport } from './viewport.ts'
import { Camera } from './camera.ts'
import { InteractionManager } from './interaction-manager.ts'
import type { SceneConfig } from '../types/scene-config.ts'
import type { SceneElement } from './elements/scene-element.ts'
import { createSceneElement } from './create-scene-element.ts'
import type { Resolution } from '../components/ResolutionSelect.vue'
import type { Zoom } from '../components/ZoomSelect.vue'

class PreviewCanvasManager {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D
  private viewport: Viewport
  private camera: Camera
  private interactionManager: InteractionManager
  private artboardResolution: Resolution

  // TODO: move to the Scene class?
  private sceneElements: Map<SceneElement['id'], SceneElement>

  constructor(canvas: HTMLCanvasElement) {
    this.onClick = this.onClick.bind(this)
    this.onPanning = this.onPanning.bind(this)
    this.onScroll = this.onScroll.bind(this)

    this.canvas = canvas
    this.viewport = new Viewport(this.canvas, this.render.bind(this))
    this.camera = new Camera(new Vector2(0, 0), 1)
    this.interactionManager = new InteractionManager(
      this.canvas,
      this.onClick,
      this.onPanning,
      this.onScroll
    )
    this.sceneElements = new Map()
    this.artboardResolution = { width: 0, height: 0 }

    const context = this.canvas.getContext('2d')

    if (!context) {
      throw new Error('Failed to get canvas context.')
    }

    this.context = context
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

  public onHoverElement(newId: SceneConfig['id'] | null, prevId: SceneElement['id'] | null) {
    if (prevId) {
      this.sceneElements.get(prevId)?.setIsHovered(false)
    }

    if (newId) {
      this.sceneElements.get(newId)?.setIsHovered(true)
    }

    this.render()
  }

  public onSelectElement(newId: SceneConfig['id'] | null, prevId: SceneElement['id'] | null) {
    if (prevId) {
      this.sceneElements.get(prevId)?.setIsSelected(false)
    }

    if (newId) {
      this.sceneElements.get(newId)?.setIsSelected(true)
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

    this.viewport.applyTransform(this.context)
    this.camera.applyTransform(this.context)

    // Draw Artboard
    this.drawArtboard()

    // Render scene elements
    const elementsToRender: SceneElement[] = Array.from(this.sceneElements.values()).sort(
      (a, b) => a.getZIndex() - b.getZIndex()
    )
    for (const element of elementsToRender) {
      element.draw(this.context)
    }

    // Debug elements
    this.context.save()
    this.context.fillStyle = 'white'
    this.context.fillRect(0, 0, 10, 10)

    this.renderCameraDebugInfo()
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

  private onClick(_screenX: number, _screenY: number): boolean {
    // TODO: implement
    console.log('onClick')
    return false
  }

  private onPanning(screenDX: number, screenDY: number): boolean {
    this.camera.moveBy(new Vector2(screenDX, screenDY))
    this.render()

    return true
  }

  private onScroll(zoomDelta: number, _screenX: number, _screenY: number): boolean {
    this.camera.adjustZoomWithBounds(zoomDelta / 40)
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
