<script setup lang="ts">
import BaseSelect from './BaseSelect.vue'
import { defineProps, defineEmits, computed } from 'vue'

export type Resolution = {
  width: number
  height: number
}

export type ResolutionOption = {
  label: string
  value: Resolution
}

const RESOLUTION_OPTIONS: ResolutionOption[] = [
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

const { modelValue } = defineProps<{
  modelValue: Resolution
}>()

const emit = defineEmits<{
  'update:modelValue': [resolution: Resolution]
}>()

const resolution = computed({
  get: () => modelValue,
  set: (resolution: Resolution) => emit('update:modelValue', resolution),
})
</script>

<template>
  <BaseSelect v-model="resolution" label="Resolution" :options="RESOLUTION_OPTIONS" />
</template>
