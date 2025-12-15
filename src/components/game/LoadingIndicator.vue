<template>
  <div class="thinking-indicator">
    <Thinking 
      :size="isMobile ? 'small' : 'medium'" 
      color="#667eea" 
      :duration="1500" 
    />
    <span :class="['thinking-text', isMobile ? 'text-sm' : '']">
      AI助手正在思考...
    </span>
  </div>
</template>

<script setup lang="ts">
import { useMobile } from '@/composables/useMobile'

const { isMobile } = useMobile()
</script>

<style scoped>
.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.thinking-text {
  color: rgba(255, 255, 255, 0.9);
}

.thinking-indicator :deep(.thinking) {
  animation: thinking-pulse 1.5s ease-in-out infinite;
}

@keyframes thinking-pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>

