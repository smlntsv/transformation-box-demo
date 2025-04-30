<script setup lang="ts">
import { ref } from 'vue'
import ResolutionSelect, { type Resolution } from './components/ResolutionSelect.vue'
import ZoomSelect, { type Zoom } from './components/ZoomSelect.vue'

const resolution = ref<Resolution>({ width: 640, height: 480 })
const zoom = ref<Zoom>(1)
</script>

<template>
  <div class="container">
    <div class="base-secondary-container options">
      <ResolutionSelect v-model="resolution" />
      <ZoomSelect v-model="zoom" />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #1c1c1e;
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
}
</style>
