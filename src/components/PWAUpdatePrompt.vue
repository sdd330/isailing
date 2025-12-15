<template>
  <el-card
    v-if="needRefresh"
    class="pwa-update-prompt glass-effect"
    shadow="hover"
  >
    <div class="flex items-center gap-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-2xl">🔄</span>
          <h3 class="text-lg font-bold text-gray-800 m-0">发现新版本</h3>
        </div>
        <p class="text-sm text-gray-600 m-0">
          应用已更新，点击刷新以获取最新版本
        </p>
      </div>
      <div class="flex gap-2">
        <el-button
          type="primary"
          size="small"
          :loading="updating"
          @click="handleUpdate"
        >
          立即更新
        </el-button>
        <el-button
          type="default"
          size="small"
          plain
          @click="dismiss"
        >
          稍后
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePWA } from '@/composables/usePWA'

const { needRefresh, update } = usePWA()
const updating = ref(false)
const dismissed = ref(false)

const handleUpdate = async () => {
  updating.value = true
  try {
    await update()
    // 更新后刷新页面
    window.location.reload()
  } catch (error) {
    console.error('更新失败:', error)
    updating.value = false
  }
}

const dismiss = () => {
  dismissed.value = true
}
</script>

<style scoped>
.pwa-update-prompt {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 500px;
  width: calc(100% - 40px);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateX(-50%) translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.glass-effect {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .pwa-update-prompt {
    top: 10px;
    width: calc(100% - 20px);
  }
}
</style>
