import type { MoneyEvent } from '@/types/game'
import type { GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import type { IMessageHandler } from '../interfaces/IMessageHandler'
import { Random } from '../utils/Random'
import { debugLog } from '../../utils/debug'

export class MoneyEventHandler {
  constructor(
    private state: GameState,
    private config: GameConfig,
    private events: MoneyEvent[],
    private messageHandler: IMessageHandler
  ) {}

  process(): void {
    this.events.forEach((event, index) => {
      const randomNum = Random.num(this.config.random.moneyRange)
      if (randomNum % event.freq === 0) {
        let message = ''
        
        if (event.cashBased) {
          const cash = this.state.cash
          const minCash = event.minCash || 1000
          const maxCash = event.maxCash || 100000
          
          if (cash < minCash) {
            return
          }
          
          const investAmount = Math.min(cash, maxCash)
          
          if (event.isProfit !== undefined) {
            if (event.isProfit && event.profitMultiplier) {
              const profit = Math.floor(investAmount * event.profitMultiplier)
              this.state.cash += profit
              message = `${event.message}，赚了${profit.toLocaleString()}元！`
            } else if (!event.isProfit && event.lossMultiplier) {
              const loss = Math.floor(investAmount * event.lossMultiplier)
              this.state.cash -= loss
              if (this.state.cash < 0) this.state.cash = 0
              message = `${event.message}，损失了${loss.toLocaleString()}元`
            }
          } else {
            // 随机决定是盈利还是亏损（50%概率）
            const isWin = Random.num(100) < 50
            if (isWin && event.profitMultiplier) {
              // 盈利：赚钱
              const profit = Math.floor(investAmount * event.profitMultiplier)
              this.state.cash += profit
              // 根据消息类型选择不同的表达方式
              if (event.message.includes('彩票')) {
                message = `${event.message}中奖，赚了${profit.toLocaleString()}元！`
              } else if (event.message.includes('炒股')) {
                message = `${event.message}赚了一笔，赚了${profit.toLocaleString()}元！`
              } else if (event.message.includes('众筹')) {
                message = `${event.message}成功，赚了${profit.toLocaleString()}元！`
              } else {
                message = `${event.message}，赚了${profit.toLocaleString()}元！`
              }
            } else if (!isWin && event.lossMultiplier) {
              // 亏损：损失本金
              const loss = Math.floor(investAmount * event.lossMultiplier)
              this.state.cash -= loss
              if (this.state.cash < 0) this.state.cash = 0
              // 根据消息类型选择不同的表达方式
              if (event.message.includes('彩票')) {
                message = `${event.message}未中奖，损失了${loss.toLocaleString()}元`
              } else if (event.message.includes('炒股')) {
                message = `${event.message}亏了一笔，损失了${loss.toLocaleString()}元`
              } else if (event.message.includes('众筹')) {
                message = `${event.message}失败，损失了${loss.toLocaleString()}元`
              } else {
                message = `${event.message}，损失了${loss.toLocaleString()}元`
              }
            }
          }
        } else if (index === 4 || index === 5) {
          if (this.state.bankSavings > 0) {
            // cashMultiplier 表示减少的百分比
            const loss = Math.floor((this.state.bankSavings / 100) * event.cashMultiplier)
            this.state.bankSavings -= loss
            if (this.state.bankSavings < 0) this.state.bankSavings = 0
            if (loss > 0) {
              message = `${event.message}，你的存款减少了${loss.toLocaleString()}元，倒霉呀！`
            } else {
              message = event.message
            }
          }
        } else if (event.cashMultiplier !== undefined && event.cashMultiplier !== 0) {
          // 非 cashBased 且带 cashMultiplier 的事件：
          //  - cashMultiplier > 0 表示按百分比扣钱（花钱/亏钱）
          //  - cashMultiplier < 0 表示按百分比赚钱（收入/赚了一笔）
          const rate = Math.abs(event.cashMultiplier)
          const delta = Math.floor((this.state.cash / 100) * rate)
          
          if (event.cashMultiplier > 0) {
            // 扣钱
            this.state.cash -= delta
            if (this.state.cash < 0) this.state.cash = 0
            if (delta > 0) {
              message = `${event.message}，现金减少了${delta.toLocaleString()}元`
            } else {
              message = event.message
            }
          } else {
            // 赚钱
            this.state.cash += delta
            if (delta > 0) {
              message = `${event.message}，赚了${delta.toLocaleString()}元！`
            } else {
              message = event.message
            }
          }
        }
        
        if (message) {
          debugLog('[MoneyEvent] 触发事件:', message, '随机数:', randomNum, 'freq:', event.freq)
          this.messageHandler.show(message)
        }
      }
    })
  }
}

