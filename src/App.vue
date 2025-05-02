<script setup lang="ts">
import { ref } from 'vue'
import ResolutionSelect, { type Resolution } from './components/ResolutionSelect.vue'
import ZoomSelect, { type Zoom } from './components/ZoomSelect.vue'
import SceneElementPreview from './components/SceneElementPreview.vue'
import snowImage from './assets/snow-1280x853.jpg'
import type { SceneConfig } from './types/scene-config.ts'
import PreviewCanvas from './components/PreviewCanvas.vue'

const resolution = ref<Resolution>({ width: 640, height: 480 })
const zoom = ref<Zoom>(1)
const hoveredSceneElementId = ref<SceneConfig['id'] | null>(null)
const selectedSceneElementId = ref<SceneConfig['id'] | null>(null)
const demoScene = ref<SceneConfig[]>([
  {
    id: 1,
    position: { x: 0, y: 0 },
    size: { x: 1280, y: 853 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    zIndex: 1,
    type: 'image',
    src: snowImage,
  },
  {
    id: 2,
    position: { x: 100, y: 200 },
    size: { x: 100, y: 100 },
    scale: { x: 0.5, y: 0.5 },
    rotation: 0,
    zIndex: 2,
    type: 'rectangle',
    color: '#818cf8',
  },
  {
    id: 3,
    position: { x: 200, y: 400 },
    size: { x: 100, y: 100 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    zIndex: 3,
    type: 'rectangle',
    color: 'red',
  },
])
</script>

<template>
  <div class="container">
    <PreviewCanvas
      v-model:elements="demoScene"
      v-model:hovered="hoveredSceneElementId"
      v-model:selected="selectedSceneElementId"
      :resolution="resolution"
      :zoom="zoom"
    />

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
  flex-grow: 1;
  background-color: var(--main-background-color);
}

.base-secondary-container {
  border-radius: 0.4rem;
  padding: 0.8rem 1rem;
  background-color: var(--secondary-background-color);
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
