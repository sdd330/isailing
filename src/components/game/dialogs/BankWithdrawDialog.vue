<template>
  <el-dialog
    v-model="dialogVisible"
    title="💸 银行取款"
    :width="isMobile ? '90%' : '480px'"
    align-center
    destroy-on-close
    class="dialog-compact"
  >
    <el-form label-width="100px" label-position="left">
      <el-form-item label="当前现金">
        <span class="text-base text-success">{{ gameState.cash.toLocaleString() }}元</span>
      </el-form-item>
      <el-form-item label="银行存款">
        <span class="text-base text-primary">{{ gameState.bankSavings.toLocaleString() }}元</span>
      </el-form-item>
      <el-form-item label="取款金额">
        <el-input-number
          v-model="amount"
          :min="0"
          :max="gameState.bankSavings"
          :step="100"
          :precision="0"
          placeholder="输入取款金额"
          class="w-full"
          :controls="true"
        />
      </el-form-item>
      <el-form-item label="快捷选择">
        <div class="flex flex-wrap gap-2">
          <el-check-tag
            class="quick-tag"
            :checked="amount === Math.floor(gameState.bankSavings * 0.5)"
            @change="() => amount = Math.floor(gameState.bankSavings * 0.5)"
          >
            50%
          </el-check-tag>
          <el-check-tag
            class="quick-tag"
            :checked="amount === gameState.bankSavings"
            @change="() => amount = gameState.bankSavings"
          >
            全部
          </el-check-tag>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认取款</el-button>
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
    amount.value = Math.min(props.gameState.bankSavings, gameConfig.dialogs.defaultWithdrawAmount)
  }
})

const handleConfirm = () => {
  if (amount.value > 0) {
    emit('confirm', amount.value)
  }
}
</script>
