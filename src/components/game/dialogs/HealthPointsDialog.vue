<template>
  <el-dialog
    v-model="dialogVisible"
    title="🏥 医院治疗"
    :width="isMobile ? '90%' : '480px'"
    align-center
    destroy-on-close
    class="dialog-compact"
  >
    <el-form label-width="100px" label-position="left">
      <el-form-item label="当前健康">
        <span class="text-base font-medium">{{ gameState.health }}/100</span>
      </el-form-item>
      <el-form-item label="可恢复点数">
        <span class="text-base text-warning">{{ maxPoints }}点</span>
      </el-form-item>
      <el-form-item label="治疗费用">
        <span class="text-base">每点健康 {{ costPerPoint.toLocaleString() }}元</span>
      </el-form-item>
      <el-form-item label="当前现金">
        <span class="text-base text-success">{{ gameState.cash.toLocaleString() }}元</span>
      </el-form-item>
      <el-form-item label="恢复点数">
        <el-input-number
          v-model="points"
          :min="1"
          :max="maxPoints"
          :step="1"
          :precision="0"
          placeholder="输入要恢复的健康点数"
          class="w-full"
          :controls="true"
        />
      </el-form-item>
      <el-form-item label="快捷选择">
        <div class="flex flex-wrap gap-2">
          <el-check-tag 
            class="quick-tag"
            :checked="points === 1"
            @change="() => points = 1"
          >
            1点
          </el-check-tag>
          <el-check-tag 
            class="quick-tag"
            :checked="points === Math.floor(maxPoints * 0.5)"
            @change="() => points = Math.max(1, Math.floor(maxPoints * 0.5))"
          >
            50%
          </el-check-tag>
          <el-check-tag 
            class="quick-tag"
            :checked="points === maxPoints"
            @change="() => points = maxPoints"
          >
            全部
          </el-check-tag>
        </div>
      </el-form-item>
      <el-form-item label="总费用">
        <span class="text-lg font-bold text-danger">{{ totalCost.toLocaleString() }}元</span>
      </el-form-item>
      <el-form-item v-if="points > 0" label="恢复后健康">
        <span class="text-lg font-bold text-success">{{ Math.min(100, gameState.health + points) }}/100</span>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          :disabled="!points || points <= 0 || points > maxPoints || totalCost > gameState.cash"
        >
          确认治疗
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { GameState } from '@/types/game'
import { useMobile } from '@/composables/useMobile'
import { gameConfig } from '@/config/game.config'

interface Props {
  modelValue: boolean
  gameState: GameState
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [points: number]
}>()

const { isMobile } = useMobile()
const points = ref(1)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const costPerPoint = gameConfig.buildings.hospital.costPerPoint
const maxPoints = computed(() => {
  const healthDeficit = 100 - props.gameState.health
  const maxByCash = Math.floor(props.gameState.cash / costPerPoint)
  return Math.min(healthDeficit, maxByCash)
})

const totalCost = computed(() => {
  return costPerPoint * points.value
})

watch(() => props.modelValue, (visible) => {
  if (visible) {
    // 默认选择1点或最大数量的25%
    points.value = Math.max(1, Math.floor(maxPoints.value * 0.25))
  }
})

watch(() => maxPoints.value, (newMax) => {
  if (points.value > newMax) {
    points.value = newMax
  }
})

const handleConfirm = () => {
  if (points.value > 0 && points.value <= maxPoints.value && totalCost.value <= props.gameState.cash) {
    emit('confirm', points.value)
  }
}
</script>