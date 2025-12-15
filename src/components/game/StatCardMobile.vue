<template>
  <div :class="`stat-card-mobile-${type}`">
    <div class="stat-icon-mobile">{{ icon }}</div>
    <div class="stat-value-mobile">{{ formatValue(value) }}</div>
    <div class="stat-label-mobile">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type: 'cash' | 'debt' | 'bank' | 'health' | 'warehouse' | 'score'
  value: number | string
  label: string
}

const props = defineProps<Props>()

const icon = computed(() => {
  const icons: Record<Props['type'], string> = {
    cash: '💰',
    debt: '💸',
    bank: '🏦',
    health: '❤️',
    warehouse: '📦',
    score: '⭐'
  }
  return icons[props.type]
})

const formatValue = (val: number | string): string => {
  if (typeof val === 'string') return val
  if (val >= 10000) return `${(val / 10000).toFixed(1)}w`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
  return val.toString()
}
</script>

