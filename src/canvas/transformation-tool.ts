import type { SceneElement } from './elements/scene-element.ts'
import type { Viewport } from './viewport.ts'
import type { Camera } from './camera.ts'
import { Vector2 } from './vector2.ts'

const ROTATE_ICON_PATH =
  'M17.91 26.8199L18.26 28.8199C19.7529 28.5596 21.1881 28.0383 22.5 27.2799L21.5 25.5499C20.3872 26.1806 19.172 26.6105 17.91 26.8199ZM24.42 23.0699L26 24.3499C26.9686 23.1869 27.7267 21.8637 28.24 20.4399L26.3701 19.7599C25.9192 20.9691 25.2592 22.0895 24.42 23.0699ZM9.50005 27.2499C10.812 28.0083 12.2472 28.5296 13.74 28.7899L14.09 26.7899C12.8262 26.5712 11.6109 26.1311 10.5 25.4899L9.50005 27.2499ZM5.67005 19.7599L3.80005 20.4399C4.30124 21.8609 5.04566 23.1839 6.00005 24.3499L6.32005 24.0899L7.54005 23.0899C6.71513 22.1065 6.06871 20.9862 5.63005 19.7799L5.67005 19.7599ZM29 15.9999C28.9963 14.4844 28.7255 12.9814 28.2001 11.5599L26.33 12.2399C26.767 13.4456 26.9936 14.7175 27 15.9999H29ZM26 7.64992C24.7801 6.1813 23.2517 4.9994 21.5234 4.18824C19.795 3.37707 17.9093 2.95654 16 2.95654C14.0908 2.95654 12.2051 3.37707 10.4767 4.18824C8.74842 4.9994 7.21998 6.1813 6.00005 7.64992V3.99992H4.00005V11.9999H12V9.99992H6.81005C7.7486 8.5661 9.00918 7.37139 10.4913 6.51107C11.9733 5.65074 13.6359 5.14859 15.3465 5.04466C17.057 4.94072 18.7682 5.23788 20.3435 5.91244C21.9188 6.58699 23.3148 7.62028 24.42 8.92992L26 7.64992Z'

enum HandleType {
  TopLeft,
  TopCenter,
  TopRight,
  RightCenter,
  BottomRight,
  BottomCenter,
  BottomLeft,
  LeftCenter,
  Rotate,
  Translate,
}

const HANDLE_CURSOR: Record<
  HandleType,
  // ↖↘ - nwse-resize; ↗↙ - nesw-resize; ↑↓ - ns-resize; ←→ - ew-resize;
  'nwse-resize' | 'nesw-resize' | 'ns-resize' | 'ew-resize' | 'grab' | 'move'
> = {
  [HandleType.TopLeft]: 'nwse-resize',
  [HandleType.TopCenter]: 'ns-resize',
  [HandleType.TopRight]: 'nesw-resize',
  [HandleType.RightCenter]: 'ew-resize',
  [HandleType.BottomRight]: 'nwse-resize',
  [HandleType.BottomCenter]: 'ns-resize',
  [HandleType.BottomLeft]: 'nesw-resize',
  [HandleType.LeftCenter]: 'ew-resize',
  [HandleType.Rotate]: 'grab',
  [HandleType.Translate]: 'move',
}

type Handle = {
  type: HandleType
  position: Vector2
}

const PROPORTIONAL_SCALE_HANDLE_SIZE = 8
const FREE_SCALE_HANDLE_SIZE = 6
const ROTATION_HANDLE_SIZE = 16
const ROTATION_HANDLE_OFFSET = 32

const HANDLE_RADIUS: Record<HandleType, number> = {
  [HandleType.TopLeft]: PROPORTIONAL_SCALE_HANDLE_SIZE,
  [HandleType.TopCenter]: FREE_SCALE_HANDLE_SIZE,
  [HandleType.TopRight]: PROPORTIONAL_SCALE_HANDLE_SIZE,
  [HandleType.RightCenter]: FREE_SCALE_HANDLE_SIZE,
  [HandleType.BottomRight]: PROPORTIONAL_SCALE_HANDLE_SIZE,
  [HandleType.BottomCenter]: FREE_SCALE_HANDLE_SIZE,
  [HandleType.BottomLeft]: PROPORTIONAL_SCALE_HANDLE_SIZE,
  [HandleType.LeftCenter]: FREE_SCALE_HANDLE_SIZE,
  [HandleType.Rotate]: ROTATION_HANDLE_SIZE,
  [HandleType.Translate]: ROTATION_HANDLE_SIZE,
}

const OPPOSITE_HANDLES: Record<HandleType, HandleType> = {
  [HandleType.TopLeft]: HandleType.BottomRight,
  [HandleType.TopCenter]: HandleType.BottomCenter,
  [HandleType.TopRight]: HandleType.BottomLeft,
  [HandleType.RightCenter]: HandleType.LeftCenter,
  [HandleType.BottomRight]: HandleType.TopLeft,
  [HandleType.BottomCenter]: HandleType.TopCenter,
  [HandleType.BottomLeft]: HandleType.TopRight,
  [HandleType.LeftCenter]: HandleType.RightCenter,
  [HandleType.Rotate]: HandleType.Rotate,
  [HandleType.Translate]: HandleType.Translate,
}

const HANDLE_LOCAL_POSITIONS: Record<HandleType, Vector2> = {
  [HandleType.TopLeft]: { x: -0.5, y: -0.5 },
  [HandleType.TopCenter]: { x: 0.0, y: -0.5 },
  [HandleType.TopRight]: { x: 0.5, y: -0.5 },
  [HandleType.RightCenter]: { x: 0.5, y: 0.0 },
  [HandleType.BottomRight]: { x: 0.5, y: 0.5 },
  [HandleType.BottomCenter]: { x: 0.0, y: 0.5 },
  [HandleType.BottomLeft]: { x: -0.5, y: 0.5 },
  [HandleType.LeftCenter]: { x: -0.5, y: 0.0 },
  //
  [HandleType.Rotate]: { x: 0.0, y: 0.0 },
  [HandleType.Translate]: { x: 0.0, y: 0.0 },
}

type RotationDrag = {
  centerWorld: DOMPoint
  initialPointerWorld: DOMPoint
  initialAngle: number
  initialRotation: number
}

type TranslationDrag = {
  pointerOffset: DOMPoint
}

class TransformationTool {
  private readonly element: SceneElement
  private viewport: Viewport
  private camera: Camera
  private handles: Handle[]
  private hoveredHandle: Handle | null
  private activeHandle: Handle | null
  private rotationDrag: RotationDrag
  private translationDrag: TranslationDrag
  private isTransformed: boolean

  constructor(element: SceneElement, viewport: Viewport, camera: Camera) {
    this.element = element
    this.viewport = viewport
    this.camera = camera
    this.handles = []
    this.hoveredHandle = null
    this.activeHandle = null
    this.rotationDrag = {
      centerWorld: new DOMPoint(0, 0),
      initialPointerWorld: new DOMPoint(0, 0),
      initialAngle: 0,
      initialRotation: 0,
    }
    this.translationDrag = {
      pointerOffset: new DOMPoint(),
    }
    this.isTransformed = false
    this.updateHandles()
  }

  public getTransformedElement(): SceneElement | null {
    if (!this.isTransformed) {
      return null
    }

    return this.element
  }

  public getCursor(): string | null {
    if (this.activeHandle) {
      return HANDLE_CURSOR[this.activeHandle.type]
    }

    if (this.hoveredHandle) {
      return HANDLE_CURSOR[this.hoveredHandle.type]
    }

    return null
  }

  public onPointerDown(screenX: number, screenY: number): boolean {
    this.activeHandle = this.hitTestHandles(screenX, screenY)
    const screenPoint = new DOMPoint(screenX, screenY)
    const pointerWorld = screenPoint.matrixTransform(this.camera.matrix.inverse())
    const centerWorld = new DOMPoint(this.element.getPosition().x, this.element.getPosition().y)

    if (this.activeHandle?.type === HandleType.Rotate) {
      this.rotationDrag = {
        centerWorld,
        initialPointerWorld: pointerWorld,
        initialAngle: Math.atan2(pointerWorld.y - centerWorld.y, pointerWorld.x - centerWorld.x),
        initialRotation: this.element.getRotation(),
      }
    }

    if (this.activeHandle?.type === HandleType.Translate) {
      this.translationDrag.pointerOffset = new DOMPoint(
        pointerWorld.x - centerWorld.x,
        pointerWorld.y - centerWorld.y
      )
    }

    return Boolean(this.activeHandle)
  }

  public onPointerMove(screenX: number, screenY: number): boolean {
    if (!this.activeHandle) {
      this.hoveredHandle = this.hitTestHandles(screenX, screenY)
      return Boolean(this.hoveredHandle)
    }

    const screenPoint = new DOMPoint(screenX, screenY)
    const pointerWorld = screenPoint.matrixTransform(this.camera.matrix.inverse())

    if (this.activeHandle.type === HandleType.Rotate) {
      const centerWorld = this.rotationDrag.centerWorld
      const currentAngle = Math.atan2(
        pointerWorld.y - centerWorld.y,
        pointerWorld.x - centerWorld.x
      )
      const angleDelta = currentAngle - this.rotationDrag.initialAngle
      const newRotation = this.rotationDrag.initialRotation + angleDelta * (180 / Math.PI)
      this.element.setRotation(this.normalizeAngle(newRotation))
      this.isTransformed = true
      return true
    }

    if (this.activeHandle.type === HandleType.Translate) {
      const newPosition = new Vector2(
        pointerWorld.x - this.translationDrag.pointerOffset.x,
        pointerWorld.y - this.translationDrag.pointerOffset.y
      )
      this.element.setPosition(newPosition)
      this.isTransformed = true
      return true
    }

    const { newScale, newPosition } = this.scaleObjectWithHandle(
      this.activeHandle.type,
      new Vector2(pointerWorld.x, pointerWorld.y),
      this.element
    )
    this.element.setPosition(newPosition)
    this.element.setScale(newScale)
    this.isTransformed = true

    return true
  }

  public onPointerUp() {
    this.activeHandle = null
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save()
    context.resetTransform()
    const viewportScale = this.viewport.getScale()
    context.scale(viewportScale, viewportScale)

    this.drawHandles(context)

    context.restore()
  }

  private hitTestHandles(screenX: number, screenY: number): Handle | null {
    const screenPoint = new DOMPoint(screenX, screenY)
    const worldPoint = screenPoint.matrixTransform(this.camera.matrix.inverse())

    for (const handle of this.handles) {
      if (handle.type === HandleType.Translate) {
        if (this.element.contains(worldPoint.x, worldPoint.y)) {
          return handle
        }
      } else {
        const radius = HANDLE_RADIUS[handle.type]
        const dx = screenPoint.x - handle.position.x
        const dy = screenPoint.y - handle.position.y

        if (Math.hypot(dx, dy) <= radius) {
          return handle
        }
      }
    }

    return null
  }

  private drawHandles(context: CanvasRenderingContext2D) {
    this.updateHandles()

    for (const { position, type } of this.handles) {
      if (type === HandleType.Translate) continue
      const radius = HANDLE_RADIUS[type]
      const isRotationHandle = type === HandleType.Rotate
      const isHovered = this.hoveredHandle ? this.hoveredHandle.type === type : false
      this.drawHandle(context, position.x, position.y, radius, isRotationHandle, isHovered)
    }
  }

  private drawHandle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number = 10,
    showRotationIcon: boolean = false,
    isHovered: boolean = false
  ) {
    ctx.save()

    // Circle
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fillStyle = '#ffffff'
    ctx.fill()

    if (isHovered) {
      ctx.lineWidth = 2
      ctx.strokeStyle = '#6366f1'
      ctx.stroke()
    }

    if (showRotationIcon) {
      const path = new Path2D(ROTATE_ICON_PATH)
      ctx.translate(x, y)
      const iconFitIntoRadius = radius * 0.75
      const iconOriginalRadius = 16
      const scale = iconFitIntoRadius / iconOriginalRadius
      ctx.scale(scale, scale)
      ctx.translate(-iconOriginalRadius, -iconOriginalRadius)

      ctx.lineCap = 'round'
      ctx.fillStyle = '#000000'
      ctx.shadowBlur = 0
      ctx.fill(path)
    }

    ctx.restore()
  }

  private updateHandles() {
    const localElementCorners = this.element.getLocalCorners()
    const ctm = this.camera.matrix.multiply(this.element.matrix)
    const [topLeft, topRight, bottomRight, bottomLeft] = localElementCorners.map((point) =>
      point.matrixTransform(ctm)
    )
    const elementCenter = new DOMPoint(0, 0).matrixTransform(ctm)

    const topCenter = this.calculateMiddlePoint(topLeft, topRight)
    const rightCenter = this.calculateMiddlePoint(topRight, bottomRight)
    const bottomCenter = this.calculateMiddlePoint(bottomRight, bottomLeft)
    const leftCenter = this.calculateMiddlePoint(bottomLeft, topLeft)

    const rotation = this.calculateRotationHandlePosition(
      elementCenter,
      bottomLeft,
      bottomCenter,
      bottomRight
    )

    this.handles = [
      { type: HandleType.TopLeft, position: topLeft },
      { type: HandleType.TopCenter, position: topCenter },
      { type: HandleType.TopRight, position: topRight },
      { type: HandleType.RightCenter, position: rightCenter },
      { type: HandleType.BottomRight, position: bottomRight },
      { type: HandleType.BottomCenter, position: bottomCenter },
      { type: HandleType.BottomLeft, position: bottomLeft },
      { type: HandleType.LeftCenter, position: leftCenter },
      { type: HandleType.Rotate, position: rotation },
      { type: HandleType.Translate, position: elementCenter },
    ]
  }

  private calculateRotationHandlePosition(
    elementCenter: DOMPoint,
    bottomLeft: DOMPoint,
    bottomCenter: DOMPoint,
    bottomRight: DOMPoint
  ): DOMPoint {
    // Compute a vector along the bottom edge.
    const bottomEdge = { x: bottomRight.x - bottomLeft.x, y: bottomRight.y - bottomLeft.y }

    // The perpendicular (normal) to the bottom edge can be either:
    //    n = { x: -bottomEdge.y, y: bottomEdge.x } or its negative.
    let normal = { x: -bottomEdge.y, y: bottomEdge.x }

    // Normalize the normal.
    const length = Math.hypot(normal.x, normal.y)
    if (length !== 0) {
      normal.x /= length
      normal.y /= length
    } else {
      // Avoid division by zero – default to vertical direction.
      normal = { x: 0, y: 1 }
    }

    // Decide which perpendicular points outward.
    // Compute the dot product between the normal and the vector from the object
    // center to bottomCenter. If it’s negative, flip the normal.
    const dX = bottomCenter.x - elementCenter.x
    const dY = bottomCenter.y - elementCenter.y
    const dot = normal.x * dX + normal.y * dY
    if (dot < 0) {
      normal.x *= -1
      normal.y *= -1
    }

    return new DOMPoint(
      bottomCenter.x + ROTATION_HANDLE_OFFSET * normal.x,
      bottomCenter.y + ROTATION_HANDLE_OFFSET * normal.y
    )
  }

  private calculateMiddlePoint(a: DOMPoint, b: DOMPoint): DOMPoint {
    return new DOMPoint((a.x + b.x) / 2, (a.y + b.y) / 2)
  }

  private scaleObjectWithHandle(
    handleType: HandleType,
    pointerWorld: Vector2,
    element: SceneElement
  ) {
    const stationaryHandleType = OPPOSITE_HANDLES[handleType]
    const stationaryHandle = this.handles.find((handle) => handle.type === stationaryHandleType)
    if (!stationaryHandle) {
      throw new Error('Handle not found.')
    }

    const stationaryHandleScreen = new DOMPoint(
      stationaryHandle.position.x,
      stationaryHandle.position.y
    )

    const stationaryHandleWorld = stationaryHandleScreen.matrixTransform(
      this.camera.matrix.inverse()
    )

    // Local positions of dragged and stationary handles (relative to center, in object space)
    const size = element.getSize()
    const PDrag = {
      x: HANDLE_LOCAL_POSITIONS[handleType].x * size.x,
      y: HANDLE_LOCAL_POSITIONS[handleType].y * size.y,
    }
    const PFixed = {
      x: HANDLE_LOCAL_POSITIONS[stationaryHandleType].x * size.x,
      y: HANDLE_LOCAL_POSITIONS[stationaryHandleType].y * size.y,
    }

    // Compute difference vectors
    const DLocal = {
      x: PDrag.x - PFixed.x,
      y: PDrag.y - PFixed.y,
    }
    const DWorld = {
      x: pointerWorld.x - stationaryHandleWorld.x,
      y: pointerWorld.y - stationaryHandleWorld.y,
    }

    // Undo rotation on world difference
    const angleRad = this.degToRad(element.getRotation())
    const DLocalNew = this.inverseRotateVec(DWorld, angleRad)

    // Compute new state
    const elementScale = element.getScale()
    const newScale = { x: elementScale.x, y: elementScale.y }
    if (Math.abs(DLocal.x) > 1e-6) {
      newScale.x = DLocalNew.x / DLocal.x
    }
    if (Math.abs(DLocal.y) > 1e-6) {
      newScale.y = DLocalNew.y / DLocal.y
    }

    // Clamp scale to avoid flipping or collapse
    newScale.x = Math.max(newScale.x, 0.01)
    newScale.y = Math.max(newScale.y, 0.01)

    // Compute new position so stationary handle stays fixed
    const scaled_P_fixed_new = { x: newScale.x * PFixed.x, y: newScale.y * PFixed.y }
    const rotated_scaled_P_fixed_new = this.rotateVec(scaled_P_fixed_new, angleRad)
    const newPosition = {
      x: stationaryHandleWorld.x - rotated_scaled_P_fixed_new.x,
      y: stationaryHandleWorld.y - rotated_scaled_P_fixed_new.y,
    }

    return { newScale, newPosition }
  }

  private degToRad(deg: number): number {
    return (deg * Math.PI) / 180
  }

  private inverseRotateVec(vec: Vector2, angleRad: number): Vector2 {
    // Rotate by -angle
    return this.rotateVec(vec, -angleRad)
  }

  private rotateVec(vec: Vector2, angleRad: number): Vector2 {
    const cos = Math.cos(angleRad)
    const sin = Math.sin(angleRad)

    return new Vector2(vec.x * cos - vec.y * sin, vec.x * sin + vec.y * cos)
  }

  private normalizeAngle(angle: number): number {
    return ((((angle + 180) % 360) + 360) % 360) - 180
  }
}

export { TransformationTool }
