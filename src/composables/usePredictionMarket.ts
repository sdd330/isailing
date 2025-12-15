import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import type { PredictionMarketEvent, PredictionBet } from '@/types/game'
import { ElMessage } from 'element-plus'

/**
 * 预测市场相关的 composable
 */
export function usePredictionMarket() {
  const gameStore = useGameStore()
  const marketManager = computed(() => gameStore.predictionMarketManager)

  /**
   * 获取活跃事件列表
   */
  const activeEvents = computed(() => marketManager.value.getActiveEvents())

  /**
   * 获取已结算事件列表
   */
  const settledEvents = computed(() => marketManager.value.getSettledEvents())

  /**
   * 获取玩家投注记录
   */
  const playerBets = computed(() => marketManager.value.getPlayerBets())

  /**
   * 投注
   */
  const placeBet = (eventId: string, optionId: string, amount: number) => {
    const result = marketManager.value.placeBet(eventId, optionId, amount)
    if (result.success) {
      ElMessage.success(result.message)
    } else {
      ElMessage.error(result.message)
    }
    return result
  }

  /**
   * 获取事件详情
   */
  const getEventDetails = (eventId: string) => {
    return marketManager.value.getEventDetails(eventId)
  }

  /**
   * 获取玩家在某个事件上的总投注金额
   */
  const getPlayerBetAmountForEvent = (eventId: string) => {
    return marketManager.value.getPlayerBetAmountForEvent(eventId)
  }

  /**
   * 获取玩家在某个选项上的投注金额
   */
  const getPlayerBetAmountForOption = (eventId: string, optionId: string) => {
    return marketManager.value.getPlayerBetAmountForOption(eventId, optionId)
  }

  /**
   * 格式化赔率显示
   */
  const formatOdds = (odds: number): string => {
    if (odds >= 2.0) {
      return `${odds.toFixed(2)}x`
    } else if (odds >= 1.5) {
      return `${odds.toFixed(2)}x`
    } else {
      return `${odds.toFixed(2)}x`
    }
  }

  /**
   * 获取选项的投注金额显示
   */
  const getOptionBetDisplay = (event: PredictionMarketEvent, optionId: string) => {
    const option = event.options.find(o => o.id === optionId)
    if (!option) return '0'
    return option.totalBets.toLocaleString()
  }

  /**
   * 获取玩家在该事件上的投注信息
   */
  const getPlayerBetsForEvent = (eventId: string): PredictionBet[] => {
    return playerBets.value.filter(bet => bet.eventId === eventId && !bet.settled)
  }

  /**
   * 获取预测市场统计数据
   */
  const getStatistics = computed(() => {
    return marketManager.value.getMarketState().statistics
  })

  /**
   * 获取预测等级（基于胜率）
   */
  const getPredictionLevel = computed(() => {
    const winRate = getStatistics.value.winRate
    if (winRate >= 80) return { level: '大师', color: 'success' }
    if (winRate >= 60) return { level: '专家', color: 'primary' }
    if (winRate >= 40) return { level: '普通', color: 'warning' }
    return { level: '新手', color: 'info' }
  })

  /**
   * 计算潜在收益（如果投注正确）
   */
  const calculatePotentialPayout = (event: PredictionMarketEvent, optionId: string, betAmount: number): number => {
    const option = event.options.find(o => o.id === optionId)
    if (!option) return 0

    // 基于赔率计算收益：投注金额 × 赔率 - 投注金额
    // 赔率已经包含了市场费率
    const payout = Math.floor(betAmount * option.odds - betAmount)
    return Math.max(0, payout) // 确保不出现负数
  }

  return {
    activeEvents,
    settledEvents,
    playerBets,
    placeBet,
    getEventDetails,
    getPlayerBetAmountForEvent,
    getPlayerBetAmountForOption,
    formatOdds,
    getOptionBetDisplay,
    getPlayerBetsForEvent,
    calculatePotentialPayout,
    getStatistics,
    getPredictionLevel
  }
}

