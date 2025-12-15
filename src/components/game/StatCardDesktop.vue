<template>
  <el-tooltip :content="tooltip" placement="bottom">
    <div :class="['stat-card', `stat-${type}`]">
      <div class="stat-icon">{{ icon }}</div>
      <div class="stat-value">{{ formatValue(value) }}</div>
      <div class="stat-label">{{ label }}</div>
      <el-progress 
        v-if="showProgress"
        :percentage="progressPercentage" 
        :color="progressColor"
        :stroke-width="3"
        :show-text="false"
        :class="type === 'health' ? 'health-progress' : 'time-progress'"
      />
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type: 'cash' | 'debt' | 'bank' | 'health' | 'time' | 'warehouse' | 'score'
  value: number | string
  label: string
  tooltip: string
  showProgress?: boolean
  progressPercentage?: number
}

const props = withDefaults(defineProps<Props>(), {
  showProgress: false,
  progressPercentage: 0
})

const icon = computed(() => {
  const icons: Record<Props['type'], string> = {
    cash: '💰',
    debt: '💸',
    bank: '🏦',
    health: '❤️',
    time: '⏰',
    warehouse: '📦',
    score: '⭐'
  }
  return icons[props.type]
})

const progressColor = computed(() => {
  if (props.type === 'health') {
    if (props.progressPercentage! >= 70) return '#10b981'
    if (props.progressPercentage! >= 40) return '#f59e0b'
    return '#ef4444'
  }
  return '#f59e0b'
})

const formatValue = (val: number | string): string => {
  if (typeof val === 'string') return val
  return val.toLocaleString()
}
</script>

