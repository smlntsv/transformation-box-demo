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
    return
  }

  for (const element of elements.value) {
    if (element.id === id) {
      state.value = element.id
      break
    }
  }
}

function onElementHover(id: SceneConfig['id'] | null) {
  updateSelectedHoveredState(id, hovered)
}

function onElementSelect(id: SceneConfig['id'] | null) {
  updateSelectedHoveredState(id, selected)
}

function onElementTransform(sceneConfig: SceneConfig) {
  for (const element of elements.value) {
    if (element.id === sceneConfig.id) {
      element.position.x = sceneConfig.position.x
      element.position.y = sceneConfig.position.y
      element.scale.x = sceneConfig.scale.x
      element.scale.y = sceneConfig.scale.y
      element.rotation = sceneConfig.rotation
      break
    }
  }
}

onMounted(() => {
  manager.value = new PreviewCanvasManager(canvasRef.value as HTMLCanvasElement)
  manager.value.addEventListener(SceneElementEvent.Hover, onElementHover)
  manager.value.addEventListener(SceneElementEvent.Select, onElementSelect)
  manager.value.addEventListener(SceneElementEvent.Transform, onElementTransform)
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
  manager.value?.removeEventListener(SceneElementEvent.Hover, onElementHover)
  manager.value?.removeEventListener(SceneElementEvent.Select, onElementSelect)
  manager.value?.removeEventListener(SceneElementEvent.Transform, onElementTransform)
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
