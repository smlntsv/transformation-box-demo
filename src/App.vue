<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import ResolutionSelect, { type Resolution } from './components/ResolutionSelect.vue'
import ZoomSelect, { type Zoom } from './components/ZoomSelect.vue'
import SceneElementPreview from './components/SceneElementPreview.vue'
import snowImage from './assets/snow-1280x853.jpg'
import type { SceneConfig } from './types/scene-config.ts'
import { useResizeObserver } from './composables/use-resize-observer.ts'

const previewCanvasContainer = useTemplateRef<HTMLElement>('preview-canvas-container')
const previewCanvasContainerSize = useResizeObserver(previewCanvasContainer)
const resolution = ref<Resolution>({ width: 640, height: 480 })
const zoom = ref<Zoom>(1)
const hoveredSceneElementId = ref<SceneConfig['id'] | null>(null)
const selectedSceneElementId = ref<SceneConfig['id'] | null>(null)
const demoScene = ref<SceneConfig[]>([
  { id: 1, x: 0, y: 0, width: 100, height: 100, zIndex: 1, type: 'rectangle', color: '#818cf8' },
  { id: 2, x: 0, y: 0, width: 100, height: 100, zIndex: 2, type: 'image', src: snowImage },
])
</script>

<template>
  <div class="container">
    <!-- TODO: remove -->
    <div
      class="base-secondary-container"
      style="color: white; margin-top: 1rem; margin-bottom: 1rem; word-break: break-all"
    >
      <div>Resolution: {{ `${resolution.width}x${resolution.height}` }}</div>
      <div>Zoom: {{ String(zoom * 100) }}</div>
      <div>{{ JSON.stringify(previewCanvasContainerSize) }}</div>
      <div>Selected: {{ String(selectedSceneElementId) }}</div>
      <div>Hovered: {{ String(hoveredSceneElementId) }}</div>
    </div>

    <div ref="preview-canvas-container" class="preview-canvas-container">
      <canvas
        :width="previewCanvasContainerSize.width"
        :height="previewCanvasContainerSize.height"
        :style="{ background: 'white', position: 'absolute' }"
      ></canvas>
    </div>

    <div class="base-secondary-container options">
      <ResolutionSelect v-model="resolution" />
      <ZoomSelect v-model="zoom" />
    </div>

    <div class="base-secondary-container scene-elements-preview">
      <SceneElementPreview
        v-for="element of demoScene"
        :key="element.id"
        v-model:selected="selectedSceneElementId"
        v-model:hovered="hoveredSceneElementId"
        :element="element"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--main-background-color);
}

.base-secondary-container {
  border-radius: 0.4rem;
  padding: 0.8rem 1rem;
  background-color: var(--secondary-background-color);
}

.preview-canvas-container {
  position: relative;
  overflow: hidden;
  border-radius: 0.4rem;
  background-color: var(--secondary-background-color);
  display: flex;
  flex-grow: 1;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}

.scene-elements-preview {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  overflow-x: auto;
}
</style>
