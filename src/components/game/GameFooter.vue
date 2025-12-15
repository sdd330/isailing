<template>
  <div class="floating-footer">
    <div class="px-2 md:px-6 py-2 md:py-4 footer-operations">
      <div :class="['mx-auto', isMobile ? 'w-full px-0' : 'max-w-6xl']">
        <div v-if="isMobile" class="mobile-actions-container">
          <div class="mobile-actions-grid">
            <button
              v-for="action in quickActions.filter(a => a.id !== 'next-time')"
              :key="action.id"
              @click.stop.prevent="$emit('quick-action', action)"
              class="mobile-action-btn"
              type="button"
            >
              <span class="mobile-action-icon">{{ action.icon }}</span>
              <span class="mobile-action-text">{{ action.shortLabel }}</span>
            </button>
          </div>
          <button
            v-for="action in quickActions.filter(a => a.id === 'next-time')"
            :key="action.id"
            @click.stop.prevent="$emit('quick-action', action)"
            :disabled="isProcessing"
            class="mobile-action-btn mobile-action-btn-full"
            type="button"
          >
            <span class="mobile-action-text">{{ action.label }}</span>
          </button>
        </div>

        <div v-else class="desktop-actions-container">
          <div class="flex flex-wrap items-center justify-center gap-2.5 py-1">
            <el-button
              v-for="action in quickActions.filter(a => a.id !== 'next-time')"
              :key="action.id"
              @click.stop.prevent="$emit('quick-action', action)"
              type="primary"
              size="default"
              class="desktop-action-btn"
            >
              {{ action.label }}
            </el-button>
          </div>
          <div class="w-full py-1">
            <el-button
              v-for="action in quickActions.filter(a => a.id === 'next-time')"
              :key="action.id"
              @click.stop.prevent="$emit('quick-action', action)"
              :disabled="isProcessing"
              type="default"
              size="default"
              class="desktop-action-btn desktop-action-btn-full"
            >
              {{ action.label }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuickAction } from '@/composables/useGameKeyboard'
import { useMobile } from '@/composables/useMobile'

interface Props {
  quickActions: QuickAction[]
  isProcessing: boolean
}

defineProps<Props>()

defineEmits<{
  'quick-action': [action: QuickAction]
}>()

const { isMobile } = useMobile()
</script>

<style scoped>
.mobile-actions-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.mobile-action-btn {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-weight: 600;
}

.mobile-action-btn.mobile-action-btn-full {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  background: transparent !important;
  background-color: transparent !important;
  border: 1px solid var(--el-button-border-color, #dcdfe6) !important;
  color: var(--el-button-text-color, #606266) !important;
}

.mobile-action-btn.mobile-action-btn-full:hover:not(:disabled) {
  background: rgba(64, 158, 255, 0.1) !important;
  background-color: rgba(64, 158, 255, 0.1) !important;
  border-color: var(--el-color-primary, #409eff) !important;
  color: var(--el-color-primary, #409eff) !important;
}

.mobile-action-btn.mobile-action-btn-full:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: transparent !important;
  background-color: transparent !important;
}

.desktop-action-btn-full {
  width: 100% !important;
  min-width: 100% !important;
  padding: 0.875rem 2rem !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
}
</style>

<style>
.desktop-action-btn-full.el-button {
  width: 100% !important;
  min-width: 100% !important;
  background: transparent !important;
  background-color: transparent !important;
}

.desktop-action-btn-full.el-button:hover:not(:disabled) {
  background: rgba(64, 158, 255, 0.1) !important;
  background-color: rgba(64, 158, 255, 0.1) !important;
}

.desktop-action-btn-full.el-button:disabled {
  background: transparent !important;
  background-color: transparent !important;
}
</style>

