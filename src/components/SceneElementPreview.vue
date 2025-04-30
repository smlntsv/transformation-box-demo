<script setup lang="ts">
import {
  defineProps,
  computed,
  defineModel,
  withDefaults,
  onMounted,
  onBeforeUnmount,
  useTemplateRef,
} from 'vue'
import type { SceneConfig } from '../types/scene-config.ts'

const { element, resetSelectionOnParentClick } = withDefaults(
  defineProps<{
    element: SceneConfig
    resetSelectionOnParentClick?: boolean
  }>(),
  {
    resetSelectionOnParentClick: true,
  }
)

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
  />
</template>

<style scoped>
.scene-element {
  display: flex;
  flex-shrink: 0;
  width: 6rem;
  height: 6rem;
  border: none;
  border-radius: 0.4rem;
  outline-offset: 0.2rem;
  will-change: transform;
}

.scene-element--hovered {
  transform: scale(0.98);
  transition-duration: 0.1s;
  cursor: pointer;

  outline: 0.1rem dashed #60a5fa;
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
