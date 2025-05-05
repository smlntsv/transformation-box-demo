<script setup lang="ts">
import BaseSelect from './BaseSelect.vue'
import { defineModel } from 'vue'

export type ArtboardResolution = {
  width: number
  height: number
}

export type ArtboardResolutionOption = {
  label: string
  value: ArtboardResolution
}

const ARTBOARD_RESOLUTION_OPTIONS: ArtboardResolutionOption[] = [
  {
    label: '1920x1080 16:9',
    value: { width: 1920, height: 1080 },
  },
  {
    label: '1080x1920 9:16',
    value: { width: 1080, height: 1920 },
  },
  {
    label: '640x480 4:3',
    value: { width: 640, height: 480 },
  },
  {
    label: '600x600 1:1',
    value: { width: 600, height: 600 },
  },
]

const artboardResolution = defineModel<ArtboardResolution>()
</script>

<template>
  <BaseSelect
    v-model="artboardResolution"
    label="Resolution"
    :options="ARTBOARD_RESOLUTION_OPTIONS"
  />
</template>
