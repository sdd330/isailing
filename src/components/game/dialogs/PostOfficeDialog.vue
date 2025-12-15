<template>
  <el-dialog
    v-model="dialogVisible"
    title="📬 邮局还债"
    :width="isMobile ? '90%' : '480px'"
    align-center
    destroy-on-close
    class="dialog-compact"
  >
    <el-form label-width="100px" label-position="left">
      <el-form-item label="当前债务">
        <span class="text-base text-danger">{{ gameState.debt.toLocaleString() }}元</span>
      </el-form-item>
      <el-form-item label="可用现金">
        <span class="text-base text-success">{{ gameState.cash.toLocaleString() }}元</span>
      </el-form-item>
      <el-form-item label="还债金额">
        <el-input-number
          v-model="amount"
          :min="0"
          :max="Math.min(gameState.cash, gameState.debt)"
          :step="100"
          :precision="0"
          placeholder="输入还债金额"
          class="w-full"
          :controls="true"
        />
      </el-form-item>
      <el-form-item label="快捷选择">
        <div class="flex flex-wrap gap-2">
          <el-check-tag 
            class="quick-tag"
            :checked="amount === Math.floor(Math.min(gameState.cash, gameState.debt) * 0.5)"
            @change="() => amount = Math.floor(Math.min(gameState.cash, gameState.debt) * 0.5)"
          >
            50%
          </el-check-tag>
          <el-check-tag
            class="quick-tag"
            :checked="amount === Math.min(gameState.cash, gameState.debt)"
            @change="() => amount = Math.min(gameState.cash, gameState.debt)"
          >
            全部
          </el-check-tag>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认还债</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { GameState } from '@/types/game'
import { gameConfig } from '@/config/game.config'
import { useMobile } from '@/composables/useMobile'

interface Props {
  modelValue: boolean
  gameState: GameState
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [amount: number]
}>()

const { isMobile } = useMobile()
const amount = ref(0)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

watch(() => props.modelValue, (visible) => {
  if (visible) {
    amount.value = Math.min(props.gameState.cash, props.gameState.debt)
  }
})

const handleConfirm = () => {
  if (amount.value > 0) {
    emit('confirm', amount.value)
  }
}
</script>
