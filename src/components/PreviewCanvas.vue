<script setup lang="ts">
import {
  defineProps,
  defineModel,
  useTemplateRef,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'
import type { SceneConfig } from '../types/scene-config.ts'
import type { Resolution } from './ResolutionSelect.vue'
import type { Zoom } from './ZoomSelect.vue'
import { PreviewCanvasManager } from './../canvas/preview-canvas-manager.ts'

const { resolution, zoom } = defineProps<{
  resolution: Resolution
  zoom: Zoom
}>()

// emit hover, select, transform event and process in the parent component
// or modify in-place?

const selected = defineModel<SceneConfig['id'] | null>('selected', { default: null })
const hovered = defineModel<SceneConfig['id'] | null>('hovered', { default: null })
const elements = defineModel<SceneConfig[]>('elements', { default: [] })
const canvasRef = useTemplateRef('canvas')
const manager = ref<PreviewCanvasManager>()

onMounted(() => {
  manager.value = new PreviewCanvasManager(canvasRef.value as HTMLCanvasElement)
  manager.value.onElementsChange(elements.value)
  manager.value.onResolutionChange(resolution)
  manager.value.onZoomChange(zoom)
  manager.value.render()
})

watch(
  () => resolution,
  (newResolution: Resolution) => {
    manager.value?.onResolutionChange(newResolution)
  }
)

watch(
  () => zoom,
  (newZoom) => {
    manager.value?.onZoomChange(newZoom)
  }
)

watch(elements, (newElements) => {
  manager.value?.onElementsChange(newElements)
})

watch(hovered, (newHovered, prevHovered) => {
  manager.value?.onHoverElement(newHovered, prevHovered)
})

watch(selected, (newSelected, prevSelected) => {
  manager.value?.onSelectElement(newSelected, prevSelected)
})

onBeforeUnmount(() => {
  manager.value?.destroy()
})
</script>

<template>
  <div class="preview-canvas-container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.preview-canvas-container {
  position: relative;
  overflow: hidden;
  border-radius: 0.4rem;
  background-color: var(--secondary-background-color);
  display: flex;
  flex-grow: 1;
}

canvas {
  position: absolute;
}
</style>
