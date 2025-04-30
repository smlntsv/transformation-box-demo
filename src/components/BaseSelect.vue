<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'

export type BaseSelectOption = {
  label: string
  value: unknown
}

const { modelValue } = defineProps<{
  label: string
  options: BaseSelectOption[]
  modelValue: unknown
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const selected = computed({
  get: () => modelValue,
  set: (value: unknown) => emit('update:modelValue', value),
})
</script>

<template>
  <label>
    {{ label }}
    <select v-model="selected">
      <option v-for="option in options" :key="option.label" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
label {
  color: #94a3b8;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

select {
  border: none;
  color: white;
  font-size: 1rem;
  width: fit-content;
  background: transparent;
}

select:focus {
  outline: 2px solid blue;
  outline-offset: 0.1rem;
  border-radius: 0.2rem;
}
</style>
