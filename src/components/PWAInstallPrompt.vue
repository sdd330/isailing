<template>
  <el-card
    v-if="showInstallPrompt && !isInstalled"
    class="pwa-install-prompt glass-effect"
    shadow="hover"
  >
    <div class="flex items-center gap-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-2xl">📱</span>
          <h3 class="text-lg font-bold text-gray-800 m-0">安装应用</h3>
        </div>
        <p class="text-sm text-gray-600 m-0">
          将「iSailing」添加到主屏幕，享受更快的访问速度和离线体验
        </p>
      </div>
      <div class="flex gap-2">
        <el-button
          type="primary"
          size="small"
          @click="handleInstall"
        >
          安装
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
import { ref, onMounted, watch } from 'vue'
import { usePWA } from '@/composables/usePWA'

const { isInstalled, showInstallPrompt, install } = usePWA()
const dismissed = ref(false)

const handleInstall = async () => {
  const success = await install()
  if (success) {
    dismissed.value = true
  }
}

const dismiss = () => {
  dismissed.value = true
  showInstallPrompt.value = false
}

// 监听关闭事件，保存到 localStorage
watch(dismissed, (newVal) => {
  if (newVal) {
    localStorage.setItem('pwa-install-dismissed', 'true')
  }
})

onMounted(() => {
  // 检查是否已经关闭过提示
  const wasDismissed = localStorage.getItem('pwa-install-dismissed')
  if (wasDismissed) {
    dismissed.value = true
    showInstallPrompt.value = false
  }
})
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 500px;
  width: calc(100% - 40px);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
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
  .pwa-install-prompt {
    bottom: 10px;
    width: calc(100% - 20px);
  }
}
</style>
