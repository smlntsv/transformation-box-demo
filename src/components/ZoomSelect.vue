<script setup lang="ts">
import BaseSelect from './BaseSelect.vue'
import { defineModel, computed } from 'vue'

export type Zoom = number

export type ZoomOption = {
  label: string
  value: Zoom
}

const ZOOM_OPTIONS: ZoomOption[] = [
  {
    label: '200%',
    value: 2,
  },
  {
    label: '100%',
    value: 1,
  },
  {
    label: '50%',
    value: 0.5,
  },
  {
    label: '25%',
    value: 0.25,
  },
]

const zoom = defineModel<Zoom>()

const withCurrentZoomOptions = computed(() => {
  const isAlreadyExists = ZOOM_OPTIONS.find((option) => option.value === zoom.value)

  if (!isAlreadyExists && zoom.value) {
    return [{ label: `${(zoom.value * 100).toFixed(0)} %`, value: zoom.value }, ...ZOOM_OPTIONS]
  }

  return ZOOM_OPTIONS
})
</script>

<template>
  <BaseSelect v-model="zoom" label="Zoom" :options="withCurrentZoomOptions" />
</template>
