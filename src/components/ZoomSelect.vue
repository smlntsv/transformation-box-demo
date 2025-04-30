<script setup lang="ts">
import BaseSelect from './BaseSelect.vue'
import { defineProps, defineEmits, computed } from 'vue'

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

const { modelValue } = defineProps<{
  modelValue: Zoom
}>()

const emit = defineEmits<{
  'update:modelValue': [zoom: Zoom]
}>()

const zoom = computed({
  get: () => modelValue,
  set: (zoom: Zoom) => emit('update:modelValue', zoom),
})
</script>

<template>
  <BaseSelect v-model="zoom" label="Zoom" :options="ZOOM_OPTIONS" />
</template>
