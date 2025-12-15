<template>
  <transition name="slide-down">
    <div v-if="!isOnline" class="offline-indicator">
      <div class="flex items-center justify-center gap-2">
        <span class="text-lg">📡</span>
        <span class="text-sm font-medium">当前处于离线模式</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { offlineManager } from '@/utils/offline'

const isOnline = ref(offlineManager.isOnline())
let cleanup: (() => void) | null = null

onMounted(() => {
  cleanup = offlineManager.onStatusChange((online) => {
    isOnline.value = online
  })
})

onUnmounted(() => {
  if (cleanup) {
    cleanup()
  }
})
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 12px;
  text-align: center;
  z-index: 10000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}
</style>
