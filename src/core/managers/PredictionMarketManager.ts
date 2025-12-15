import type { GameState } from '@/types/game'
import type { PredictionMarketEvent, PredictionMarketOption, PredictionBet, PredictionMarketState } from '@/types/game'

/**
 * 预测市场管理器
 * 类似 PolyMarket 的预测市场功能
 */
export class PredictionMarketManager {
  constructor(private state: GameState) {}

  /**
   * 获取预测市场状态
   */
  getMarketState(): PredictionMarketState {
    return this.state.predictionMarket
  }

  /**
   * 获取活跃事件列表
   */
  getActiveEvents(): PredictionMarketEvent[] {
    return this.state.predictionMarket.activeEvents
  }

  /**
   * 获取已结算事件列表
   */
  getSettledEvents(): PredictionMarketEvent[] {
    return this.state.predictionMarket.settledEvents
  }

  /**
   * 获取玩家的投注记录
   */
  getPlayerBets(): PredictionBet[] {
    return this.state.predictionMarket.bets
  }

  /**
   * 获取特定事件的投注记录
   */
  getBetsForEvent(eventId: string): PredictionBet[] {
    return this.state.predictionMarket.bets.filter(bet => bet.eventId === eventId)
  }

  /**
   * 创建新事件
   */
  createEvent(event: Omit<PredictionMarketEvent, 'status' | 'createdAt'>): PredictionMarketEvent {
    const newEvent: PredictionMarketEvent = {
      ...event,
      status: 'active',
      createdAt: this.getCurrentWeek()
    }

    // 初始化选项的赔率（基于总投注金额，初始时平均分配）
    newEvent.options = newEvent.options.map(option => ({
      ...option,
      odds: 1 / newEvent.options.length, // 初始平均概率
      totalBets: 0
    }))

    this.state.predictionMarket.activeEvents.push(newEvent)
    return newEvent
  }

  /**
   * 投注
   * @param eventId 事件ID
   * @param optionId 选项ID
   * @param amount 投注金额
   * @returns 是否成功
   */
  placeBet(eventId: string, optionId: string, amount: number): { success: boolean; message: string } {
    // 检查现金是否足够
    if (this.state.cash < amount) {
      return { success: false, message: '现金不足，无法投注' }
    }

    // 查找事件
    const event = this.state.predictionMarket.activeEvents.find(e => e.id === eventId)
    if (!event) {
      return { success: false, message: '事件不存在或已结算' }
    }

    // 检查投注金额范围
    if (amount < event.minBet) {
      return { success: false, message: `最小投注金额为 ${event.minBet} 元` }
    }
    if (amount > event.maxBet) {
      return { success: false, message: `最大投注金额为 ${event.maxBet} 元` }
    }

    // 查找选项
    const option = event.options.find(o => o.id === optionId)
    if (!option) {
      return { success: false, message: '选项不存在' }
    }

    // 扣除现金
    this.state.cash -= amount

    // 记录投注
    const bet: PredictionBet = {
      id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventId,
      optionId,
      amount,
      oddsAtBet: option.odds,
      betAt: this.getCurrentWeek(),
      settled: false
    }
    this.state.predictionMarket.bets.push(bet)
    this.state.predictionMarket.totalBetsAmount += amount

    // 更新选项的总投注金额
    option.totalBets += amount

    // 重新计算所有选项的赔率（基于总投注金额）
    this.updateOdds(event)

    return { success: true, message: '投注成功' }
  }

  /**
   * 更新事件的赔率
   * 基于总投注金额动态计算赔率（类似PolyMarket的机制）
   */
  private updateOdds(event: PredictionMarketEvent): void {
    const totalBets = event.options.reduce((sum, opt) => sum + opt.totalBets, 0)

    if (totalBets === 0) {
      // 如果还没有投注，平均分配概率
      const equalOdds = 1 / event.options.length
      event.options.forEach(opt => {
        opt.odds = equalOdds
      })
      return
    }

    // 实现真正的动态赔率系统：
    // 1. 赔率 = 总投注金额 / 该选项投注金额
    // 2. 热门选项赔率低，冷门选项赔率高
    // 3. 添加市场费率（类似交易所的手续费）
    const marketFee = 0.05 // 5%的市场费率

    event.options.forEach(opt => {
      if (opt.totalBets === 0) {
        // 如果该选项无人投注，设置较高赔率（鼓励投注）
        opt.odds = Math.max(2.0, totalBets / 100) // 最低2.0赔率
      } else {
        // 计算基础赔率：总投注 / 该选项投注
        const baseOdds = totalBets / opt.totalBets
        // 扣除市场费率后的实际赔率
        opt.odds = baseOdds * (1 - marketFee)
        // 确保赔率在合理范围内
        opt.odds = Math.max(1.1, Math.min(10.0, opt.odds))
      }
    })
  }

  /**
   * 结算事件
   * @param eventId 事件ID
   * @param correctOptionId 正确选项ID
   */
  settleEvent(eventId: string, correctOptionId: string): void {
    const eventIndex = this.state.predictionMarket.activeEvents.findIndex(e => e.id === eventId)
    if (eventIndex === -1) {
      return
    }

    const event = this.state.predictionMarket.activeEvents[eventIndex]
    const correctOption = event.options.find(o => o.id === correctOptionId)
    
    if (!correctOption) {
      return
    }

    // 标记正确选项
    correctOption.isCorrect = true
    event.status = 'settled'

    // 计算总奖池（所有投注金额）
    const totalPool = event.options.reduce((sum, opt) => sum + opt.totalBets, 0)
    
    // 结算所有投注
    const betsForEvent = this.getBetsForEvent(eventId)
    const playerBets = betsForEvent.filter(bet => !bet.settled)

    playerBets.forEach(bet => {
      bet.settled = true

      if (bet.optionId === correctOptionId) {
        // 投注正确：基于赔率计算收益
        // payout = 投注金额 × 赔率
        // 赔率在投注时已经计算并包含市场费率
        const payout = Math.floor(bet.amount * correctOption.odds)
        bet.payout = payout
        this.state.cash += payout
        this.state.predictionMarket.totalPayout += payout

        // 更新统计：预测成功
        this.state.predictionMarket.statistics.successfulPredictions++
        this.state.predictionMarket.statistics.netProfit += (payout - bet.amount)
      } else {
        // 投注错误，没有收益
        bet.payout = 0
        // 更新统计：预测失败
        this.state.predictionMarket.statistics.failedPredictions++
        this.state.predictionMarket.statistics.netProfit -= bet.amount
      }

      // 更新总预测次数
      this.state.predictionMarket.statistics.totalPredictions++

      // 更新胜率
      const total = this.state.predictionMarket.statistics.totalPredictions
      if (total > 0) {
        this.state.predictionMarket.statistics.winRate =
          (this.state.predictionMarket.statistics.successfulPredictions / total) * 100
      }
    })

    // 移动到已结算列表
    this.state.predictionMarket.activeEvents.splice(eventIndex, 1)
    this.state.predictionMarket.settledEvents.push(event)
  }

  /**
   * 获取当前周数
   */
  private getCurrentWeek(): number {
    // 假设总周数为 52，当前剩余周数为 timeLeft
    // 当前周数 = 总周数 - 剩余周数 + 1
    const totalWeeks = 52 // 可以从 config 获取
    const timeLeft = this.state.timeLeft
    return Math.max(1, totalWeeks - timeLeft + 1)
  }

  /**
   * 检查并自动结算到期事件
   * @param currentWeek 当前周数
   * @param gameState 游戏状态（用于确定预测结果）
   * @param marketManager 市场管理器（用于获取商品价格）
   */
  checkAndSettleEvents(currentWeek: number, gameState?: any, marketManager?: any): PredictionMarketEvent[] {
    const settled: PredictionMarketEvent[] = []

    this.state.predictionMarket.activeEvents.forEach(event => {
      if (event.settlementWeek > 0 && currentWeek >= event.settlementWeek) {
        // 根据事件类型确定正确结果
        const correctOptionId = this.determineCorrectOption(event, gameState, marketManager)
        this.settleEvent(event.id, correctOptionId)
        settled.push(event)
      }
    })

    return settled
  }

  /**
   * 根据事件类型和游戏状态确定正确选项
   */
  private determineCorrectOption(event: PredictionMarketEvent, gameState?: any, marketManager?: any): string {
    // 如果有市场管理器，基于实际商品价格确定结果
    if (marketManager && gameState) {
      const currentCity = gameState.currentCity
      const cityGoodsIds = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) // 假设商品ID范围
      const marketGoods = marketManager.getMarketGoods(currentCity, cityGoodsIds)

      // 解析商品名称 - 从标题中提取商品名
      // 支持多种标题格式：如"进口香烟下周价位"、"进口香烟涨跌预测"
      const goodsNameMatch = event.title.match(/^(.+?)(?:下周价位|涨跌预测)$/)
      if (goodsNameMatch) {
        const goodsName = goodsNameMatch[1]
        const goods = marketGoods.find(g => g.name === goodsName)

        if (goods && goods.price > 0) {
          const currentPrice = goods.price

          if (event.title.includes('下周价位')) {
            // 根据实际价格和预测选项确定结果
            const options = event.options
            for (const option of options) {
              if (option.id.startsWith('under_')) {
                const threshold = parseInt(option.id.split('_')[1])
                if (currentPrice < threshold) return option.id
              } else if (option.id.startsWith('over_')) {
                const threshold = parseInt(option.id.split('_')[1])
                if (currentPrice > threshold) return option.id
              } else if (option.id.includes('_')) {
                const parts = option.id.split('_').map(n => parseInt(n))
                if (parts.length === 2 && currentPrice >= parts[0] && currentPrice <= parts[1]) {
                  return option.id
                }
              }
            }
            // 如果没有匹配的选项，返回第一个
            return options[0]?.id || event.options[0].id
          } else if (event.title.includes('涨跌预测')) {
            // 价格变化预测：模拟下周价格变化
            const changePercent = (Math.random() - 0.5) * 0.6 // -30% 到 +30% 的变化
            if (changePercent > 0.3) return 'rise_over_30'
            if (changePercent > 0.1) return 'rise_10_30'
            if (Math.abs(changePercent) <= 0.1) return 'change_under_10'
            if (changePercent > -0.3) return 'fall_10_30'
            return 'fall_over_30'
          }
        }
      }
    }

    // 如果无法获取实际价格，使用概率模拟
    if (event.title.includes('价格预测')) {
      // 价格区间预测
      const priceProb = Math.random()
      if (priceProb > 0.8) return 'over_500'
      if (priceProb > 0.6) return '200_500'
      if (priceProb > 0.4) return '100_200'
      if (priceProb > 0.2) return '50_100'
      return 'under_50'
    } else if (event.title.includes('价格变化')) {
      // 价格变化预测
      const changeProb = Math.random()
      if (changeProb > 0.8) return 'rise_over_30'
      if (changeProb > 0.6) return 'rise_10_30'
      if (changeProb > 0.4) return 'change_under_10'
      if (changeProb > 0.2) return 'fall_10_30'
      return 'fall_over_30'
    }

    // 默认随机选择
    return event.options[Math.floor(Math.random() * event.options.length)].id
  }

  /**
   * 获取事件详情（包含当前赔率和投注情况）
   */
  getEventDetails(eventId: string): PredictionMarketEvent | null {
    const activeEvent = this.state.predictionMarket.activeEvents.find(e => e.id === eventId)
    if (activeEvent) return activeEvent

    const settledEvent = this.state.predictionMarket.settledEvents.find(e => e.id === eventId)
    return settledEvent || null
  }

  /**
   * 获取玩家在某个事件上的总投注金额
   */
  getPlayerBetAmountForEvent(eventId: string): number {
    return this.getBetsForEvent(eventId)
      .filter(bet => !bet.settled)
      .reduce((sum, bet) => sum + bet.amount, 0)
  }

  /**
   * 获取玩家在某个选项上的投注金额
   */
  getPlayerBetAmountForOption(eventId: string, optionId: string): number {
    return this.getBetsForEvent(eventId)
      .filter(bet => bet.optionId === optionId && !bet.settled)
      .reduce((sum, bet) => sum + bet.amount, 0)
  }
}

