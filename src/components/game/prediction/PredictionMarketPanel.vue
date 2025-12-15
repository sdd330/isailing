<template>
  <div class="prediction-market-panel">
    <!-- 预测统计卡片 -->
    <div class="stats-card rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 mb-4 shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">黑市预测统计</h4>
          <el-tag type="info" size="mini" effect="plain">
            第 {{ currentWeek }} 周
          </el-tag>
        </div>
        <el-tag :type="getPredictionLevel.color" size="small" effect="plain">
          {{ getPredictionLevel.level }}预测师
        </el-tag>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div class="text-center">
          <div class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ getStatistics.totalPredictions }}</div>
          <div class="text-gray-500">总预测</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-green-600 dark:text-green-400">{{ getStatistics.successfulPredictions }}</div>
          <div class="text-gray-500">预测成功</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-orange-600 dark:text-orange-400">{{ getStatistics.winRate.toFixed(1) }}%</div>
          <div class="text-gray-500">胜率</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold" :class="getStatistics.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            {{ (getStatistics.netProfit >= 0 ? '+' : '') + getStatistics.netProfit.toLocaleString() }}
          </div>
          <div class="text-gray-500">净收益</div>
        </div>
      </div>
    </div>

    <!-- 投注提示 -->
    <div v-if="refreshPredictionTip" class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-200">
      <div class="flex items-center gap-2">
        <el-icon><SuccessFilled /></el-icon>
        <span>{{ refreshPredictionTip }}</span>
      </div>
    </div>

    <div v-if="activeEvents.length === 0" class="text-center py-8 text-gray-500 text-sm">
      <p class="mb-2">🎯 暂无活跃的黑市预测</p>
      <p class="text-xs">每周会自动生成新的商品预测事件，敬请期待！</p>
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="event in activeEvents"
        :key="event.id"
        class="event-card rounded-lg border bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">{{ getGoodsIcon(event.title) }}</span>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {{ event.title }}
              </h3>
            </div>
            <p class="text-xs text-gray-500 mb-2">{{ event.description }}</p>
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <span>结算周：第 {{ event.settlementWeek }} 周</span>
              <el-divider direction="vertical" />
              <span>投注范围：{{ event.minBet.toLocaleString() }} - {{ event.maxBet.toLocaleString() }} 元</span>
            </div>
          </div>
          <el-tag v-if="getPlayerBetAmountForEvent(event.id) > 0" type="success" size="small" effect="plain">
            已投注 {{ getPlayerBetAmountForEvent(event.id).toLocaleString() }} 元
          </el-tag>
        </div>

        <div class="space-y-2 mt-4">
          <div
            v-for="option in event.options"
            :key="option.id"
            :class="[
              'option-item rounded-md border p-3 cursor-pointer transition-all',
              option.isCorrect !== undefined
                ? option.isCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 bg-gray-50 dark:bg-gray-700/50 opacity-60'
                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
              getPlayerBetAmountForOption(event.id, option.id) > 0 && 'ring-2 ring-blue-400'
            ]"
            @click="handleBet(event, option)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 flex-1">
                <span class="text-base font-medium text-gray-900 dark:text-gray-100">
                  {{ option.text }}
                </span>
                <el-tag :type="getOddsTagType(option.odds)" size="small" effect="plain">
                  {{ formatOdds(option.odds) }}
                </el-tag>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">
                  总投注：{{ option.totalBets.toLocaleString() }} 元
                </span>
                <el-tag
                  v-if="getPlayerBetAmountForOption(event.id, option.id) > 0"
                  type="info"
                  size="small"
                  effect="plain"
                >
                  你：{{ getPlayerBetAmountForOption(event.id, option.id).toLocaleString() }} 元
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 投注对话框 -->
    <PredictionBetDialog
      v-model="betDialogVisible"
      :selectedEvent="selectedEvent"
      :selectedOption="selectedOption"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePredictionMarket } from '@/composables/usePredictionMarket'
import { useGameStore } from '@/stores/game'
import { gameConfig } from '@/config/game.config'
import type { PredictionMarketEvent, PredictionMarketOption } from '@/types/game'
import PredictionBetDialog from './PredictionBetDialog.vue'
import { getGoodsIcon } from '@/config/goodsIcons.config'
import { SuccessFilled } from '@element-plus/icons-vue'

const { activeEvents, formatOdds, getPlayerBetAmountForEvent, getPlayerBetAmountForOption, getStatistics, getPredictionLevel } = usePredictionMarket()
const gameStore = useGameStore()

// 添加刷新预测事件的提示
const refreshPredictionTip = ref('')

// 计算当前周数
const currentWeek = computed(() => {
  const totalWeeks = gameConfig.time.totalWeeks
  const timeLeft = gameStore.gameState?.timeLeft ?? gameConfig.time.totalWeeks
  return Math.max(1, totalWeeks - timeLeft + 1)
})

// getGoodsIcon 已从统一的配置中导入

const betDialogVisible = ref(false)
const selectedEvent = ref<PredictionMarketEvent | null>(null)
const selectedOption = ref<PredictionMarketOption | null>(null)

const handleBet = (event: PredictionMarketEvent, option: PredictionMarketOption) => {
  if (event.status !== 'active') return
  selectedEvent.value = event
  selectedOption.value = option
  betDialogVisible.value = true
}

// 投注对话框现在自己管理状态

const getOddsTagType = (odds: number): string => {
  if (odds <= 1.5) return 'success' // 热门选项，低赔率
  if (odds <= 3.0) return 'warning' // 中等赔率
  return 'danger' // 冷门选项，高赔率
}
</script>

<style scoped>
.event-card {
  transition: all 0.2s ease;
}

.option-item {
  transition: all 0.15s ease;
}
</style>
