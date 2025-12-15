<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`投注：${selectedEvent?.title}`"
    width="90%"
    :close-on-click-modal="false"
    :before-close="handleCancel"
  >
    <div v-if="selectedEvent && selectedOption" class="bet-dialog-content">
      <div class="event-info mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">{{ getGoodsIcon(selectedEvent.title) }}</span>
          <h3 class="text-lg font-semibold">{{ selectedEvent.title }}</h3>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ selectedEvent.description }}</p>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span>结算周：第 {{ selectedEvent.settlementWeek }} 周</span>
          <span>赔率：{{ formatOdds(selectedOption.odds) }}</span>
        </div>
      </div>

      <div class="selected-option mb-4 p-3 border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 class="font-semibold mb-2">选择选项：</h4>
        <div class="text-lg">{{ selectedOption.text }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          潜在收益：{{ calculatePotentialPayout(selectedEvent, selectedOption.id, betAmount) }} 元
        </div>
      </div>

      <div class="bet-amount-section">
        <label class="block text-sm font-medium mb-2">投注金额：</label>
        <div class="flex gap-2">
          <el-input-number
            v-model="betAmount"
            :min="selectedEvent.minBet"
            :max="Math.min(selectedEvent.maxBet, gameState.cash)"
            :step="10"
            controls-position="right"
            class="flex-1"
            :precision="0"
            :placeholder="`最少 ${selectedEvent.minBet} 元`"
            @change="updatePotentialPayout"
          />
          <el-button @click="setMaxBet" type="primary" size="small" :disabled="gameState.cash < selectedEvent.minBet">最大</el-button>
        </div>
        <div class="text-xs text-gray-500 mt-1">
          <span>范围：{{ selectedEvent.minBet.toLocaleString() }} - {{ Math.min(selectedEvent.maxBet, gameState.cash).toLocaleString() }} 元</span>
          <span class="ml-2 text-blue-600 dark:text-blue-400">
            当前现金：{{ gameState.cash.toLocaleString() }} 元
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
          :loading="isBetting"
          :disabled="!canBet"
        >
          确认投注
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { usePredictionMarket } from '@/composables/usePredictionMarket'
import type { PredictionMarketEvent, PredictionMarketOption } from '@/types/game'
import { ElMessage } from 'element-plus'
import { getGoodsIcon } from '@/config/goodsIcons.config'

interface Props {
  modelValue: boolean
  selectedEvent: PredictionMarketEvent | null
  selectedOption: PredictionMarketOption | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const gameStore = useGameStore()
const { placeBet, formatOdds, calculatePotentialPayout } = usePredictionMarket()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const betAmount = ref(0)
const isBetting = ref(false)

const gameState = computed(() => gameStore.gameState)

const canBet = computed(() => {
  if (!props.selectedEvent || !props.selectedOption) return false
  return betAmount.value >= props.selectedEvent.minBet &&
         betAmount.value <= Math.min(props.selectedEvent.maxBet, gameState.value.cash) &&
         betAmount.value > 0
})

// 监听事件变化，重置投注金额
watch(() => props.selectedEvent, () => {
  if (props.selectedEvent) {
    betAmount.value = props.selectedEvent.minBet
  }
})

const setMaxBet = () => {
  if (props.selectedEvent) {
    betAmount.value = Math.min(props.selectedEvent.maxBet, gameState.value.cash)
  }
}

const updatePotentialPayout = () => {
  // 自动更新潜在收益显示
}

// getGoodsIcon 已从统一的配置中导入

const handleCancel = () => {
  dialogVisible.value = false
  betAmount.value = 0
}

const handleConfirm = () => {
  if (!props.selectedEvent || !props.selectedOption) return

  isBetting.value = true
  try {
    const result = placeBet(props.selectedEvent.id, props.selectedOption.id, betAmount.value)

    if (result.success) {
      ElMessage.success('投注成功！新预测事件将在下周刷新。')
      dialogVisible.value = false
      betAmount.value = 0
    } else {
      ElMessage.error(result.message || '投注失败')
    }
  } catch (error) {
    ElMessage.error('投注失败，请重试')
  } finally {
    isBetting.value = false
  }
}
</script>

<style scoped>
.bet-dialog-content {
  min-height: 300px;
}
</style>
