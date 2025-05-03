<script setup lang="ts">
import {
  defineModel,
  defineProps,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue'
import type { ModelRef } from 'vue'
import type { SceneConfig } from '../types/scene-config.ts'
import type { Resolution } from './ResolutionSelect.vue'
import type { Zoom } from './ZoomSelect.vue'
import { PreviewCanvasManager, SceneElementEvent } from './../canvas/preview-canvas-manager.ts'

const { resolution, zoom } = defineProps<{
  resolution: Resolution
  zoom: Zoom
}>()

const selected = defineModel<SceneConfig['id'] | null>('selected', { default: null })
const hovered = defineModel<SceneConfig['id'] | null>('hovered', { default: null })
const elements = defineModel<SceneConfig[]>('elements', { default: [] })
const canvasRef = useTemplateRef('canvas')
const manager = ref<PreviewCanvasManager>()

function updateSelectedHoveredState(
  id: SceneConfig['id'] | null,
  state: ModelRef<SceneConfig['id'] | null>
) {
  if (id === null) {
    if (state.value) {
      state.value = null
    }

    if (canvasRef.value && canvasRef.value.style.cursor !== 'inherit') {
      canvasRef.value.style.cursor = 'inherit'
    }

    return
  }

  for (const element of elements.value) {
    if (element.id === id) {
      state.value = element.id
      break
    }
  }

  if (canvasRef.value && canvasRef.value.style.cursor !== 'pointer') {
    canvasRef.value.style.cursor = 'pointer'
  }
}

function onElementHover(id: SceneConfig['id'] | null) {
  updateSelectedHoveredState(id, hovered)
}

function onElementSelect(id: SceneConfig['id'] | null) {
  updateSelectedHoveredState(id, selected)
}

onMounted(() => {
  manager.value = new PreviewCanvasManager(canvasRef.value as HTMLCanvasElement)
  manager.value.addEventListener(SceneElementEvent.Hover, onElementHover)
  manager.value.addEventListener(SceneElementEvent.Select, onElementSelect)
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

watch(hovered, (newHovered) => {
  manager.value?.onHoverElement(newHovered)
})

watch(selected, (newSelected) => {
  manager.value?.onSelectElement(newSelected)
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
