function applyHoveredStyle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const outlineOffset = 2

  ctx.save()
  ctx.setLineDash([10, 10])
  ctx.strokeStyle = '#60a5fa'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.strokeRect(
    x - outlineOffset,
    y - outlineOffset,
    width + outlineOffset * 2,
    height + outlineOffset * 2
  )
  ctx.restore()
}

function applySelectedStyle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const outlineOffset = 2
  ctx.save()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.strokeRect(
    x - outlineOffset,
    y - outlineOffset,
    width + outlineOffset * 2,
    height + outlineOffset * 2
  )
  ctx.restore()
}

export { applyHoveredStyle, applySelectedStyle }
