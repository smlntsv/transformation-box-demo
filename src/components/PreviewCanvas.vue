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
import { PreviewCanvasManager, SceneEvent } from './../canvas/preview-canvas-manager.ts'
import type { ModelRef } from 'vue'
import type { SceneConfig } from '../types/scene-config.ts'
import type { ArtboardResolution } from './ArtboardResolutionSelect.vue'
import type { Zoom } from './ZoomSelect.vue'

const { artboardResolution } = defineProps<{
  artboardResolution: ArtboardResolution
}>()

const selected = defineModel<SceneConfig['id'] | null>('selected', { default: null })
const hovered = defineModel<SceneConfig['id'] | null>('hovered', { default: null })
const elements = defineModel<SceneConfig[]>('elements', { default: [] })
const zoom = defineModel<Zoom>('zoom', { default: 1 })
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

function onZoomChange(newZoom: number) {
  zoom.value = newZoom
}

onMounted(() => {
  manager.value = new PreviewCanvasManager(
    canvasRef.value as HTMLCanvasElement,
    artboardResolution,
    zoom.value
  )
  manager.value.addEventListener(SceneEvent.ElementHover, onElementHover)
  manager.value.addEventListener(SceneEvent.ElementSelect, onElementSelect)
  manager.value.addEventListener(SceneEvent.ElementTransform, onElementTransform)
  manager.value.addEventListener(SceneEvent.ZoomChange, onZoomChange)
  manager.value.onElementsChange(elements.value)
  manager.value.render()
})

watch(
  () => artboardResolution,
  (newArtboardResolution: ArtboardResolution) => {
    manager.value?.onArtboardResolutionChange(newArtboardResolution)
  }
)

watch(zoom, (newZoom) => {
  manager.value?.onZoomChange(newZoom)
})

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
  manager.value?.removeEventListener(SceneEvent.ElementHover, onElementHover)
  manager.value?.removeEventListener(SceneEvent.ElementSelect, onElementSelect)
  manager.value?.removeEventListener(SceneEvent.ElementTransform, onElementTransform)
  manager.value?.removeEventListener(SceneEvent.ZoomChange, onZoomChange)
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
