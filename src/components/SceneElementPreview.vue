<script setup lang="ts">
import { defineProps, computed, defineModel, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import type { SceneConfig } from '../types/scene-config.ts'

const isDebugMode = !import.meta.env.PROP

const { element, resetSelectionOnParentClick = true } = defineProps<{
  element: SceneConfig
  resetSelectionOnParentClick?: boolean
}>()

const button = useTemplateRef<HTMLButtonElement>('button')

const selected = defineModel<SceneConfig['id'] | null>('selected')
const hovered = defineModel<SceneConfig['id'] | null>('hovered')

const classes = computed(() => {
  const isSelected = element.id === selected.value
  const isHovered = element.id === hovered.value

  return [
    `scene-element scene-element__${element.type}`,
    { 'scene-element--hovered': isHovered, 'scene-element--selected': isSelected },
  ]
})

const styles = computed(() => {
  switch (element.type) {
    case 'rectangle':
      return { backgroundColor: element.color }
    case 'image':
      return { backgroundImage: `url(${element.src})` }
    default:
      return {}
  }
})

function onClick(e: MouseEvent) {
  e.stopPropagation()
  selected.value = element.id
}

function onMouseOverAndOut(isOver: boolean = true) {
  hovered.value = isOver ? element.id : null
}

function resetSelection() {
  selected.value = null
}

onMounted(() => {
  if (resetSelectionOnParentClick && button.value?.parentElement) {
    button.value.parentElement.addEventListener('click', resetSelection)
  }
})

onBeforeUnmount(() => {
  if (resetSelectionOnParentClick && button.value?.parentElement) {
    button.value.parentElement.removeEventListener('click', resetSelection)
  }
})
</script>

<template>
  <button
    ref="button"
    :class="classes"
    :style="styles"
    @click="onClick"
    @mouseover="onMouseOverAndOut(true)"
    @mouseout="onMouseOverAndOut(false)"
  >
    <template v-if="isDebugMode">
      <div>Position</div>
      <div>{{ element.position.x.toFixed(2) }} : {{ element.position.y.toFixed(2) }}</div>
      <div>Scale</div>
      <div>{{ element.scale.x.toFixed(2) }} : {{ element.scale.y.toFixed(2) }}</div>
      <div>Rotation {{ element.rotation.toFixed(2) }}</div>
    </template>
  </button>
</template>

<style scoped>
.scene-element {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  flex-shrink: 0;
  width: 6rem;
  height: 6rem;
  border: none;
  font-size: 0.6rem;
  border-radius: 0.4rem;
  outline-offset: 0.2rem;
  will-change: transform;
  color: white;
}

.scene-element--hovered {
  transform: scale(0.98);
  cursor: pointer;

  outline: 0.1rem dashed #ffffff;
  box-shadow: 0 0 8px 2px #2563eb;
}

.scene-element--selected {
  outline: 0.1rem solid #ffffff;
  box-shadow: 0 0 8px 2px #2563eb;
}

.scene-element:active {
  transform: scale(0.96);
}

.scene-element__image {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
