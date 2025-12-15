import type { GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import type { IMessageHandler } from '../interfaces/IMessageHandler'
import { BaseManager } from '../base/BaseManager'

export class FinancialManager extends BaseManager {
  constructor(
    state: GameState,
    config: GameConfig,
    messageHandler: IMessageHandler,
    private checkGameOver?: () => boolean
  ) {
    super(state, config, messageHandler)
  }

  processInterest(): void {
    if (this.state.debt > 0) {
      this.state.debt = this.state.debt + Math.floor(
        this.state.debt * this.config.financial.debtInterestRate
      )
    }
    if (this.state.bankSavings > 0) {
      this.state.bankSavings = this.state.bankSavings + Math.floor(
        this.state.bankSavings * this.config.financial.bankInterestRate
      )
    }
  }

  deposit(amount: number): boolean {
    if (!amount || amount <= 0 || isNaN(amount)) {
      this.showMessage("请输入有效的存款金额！")
      return false
    }
    
    if (this.state.cash < amount) {
      this.showMessage(`现金不足！当前现金：${this.state.cash}元`)
      return false
    }
    
    this.state.cash -= amount
    this.state.bankSavings += amount
    return true
  }

  withdraw(amount: number): boolean {
    if (this.state.bankSavings < amount) {
      this.showMessage("银行存款不足！")
      return false
    }
    this.state.bankSavings -= amount
    this.state.cash += amount
    return true
  }

  repayDebt(amount: number): boolean {
    if (this.state.cash < amount) {
      this.showMessage("现金不足！")
      return false
    }

    const actualAmount = Math.min(amount, this.state.debt)
    this.state.cash -= actualAmount
    this.state.debt -= actualAmount
    this.showMessage(`成功偿还${actualAmount}元债务！`)
    return true
  }

  checkDebtLimit(): boolean {
    if (this.state.debt > this.config.financial.maxDebtLimit) {
      this.showMessage("你欠钱太多，村长派了一群人来打你一顿！健康-30")
      this.state.health -= 30
      if (this.state.health < 0) {
        this.state.health = 0
      }

      // 检查健康值是否为0导致游戏结束
      if (this.state.health <= 0) {
        this.checkGameOver?.()
      }

      return true
    }
    return false
  }

  checkBankHacking(hackerEnabled: boolean = false): boolean {
    if (!hackerEnabled || this.state.bankSavings < 1000) {
      return false
    }

    const randomNum = Math.floor(Math.random() * 1000)
    if (randomNum % 25 !== 0) {
      return false
    }

    let loss: number
    if (this.state.bankSavings > 100000) {
      const divisor = 2 + Math.floor(Math.random() * 20)
      loss = Math.floor(this.state.bankSavings / divisor)
      
      if (Math.floor(Math.random() * 20) % 3 === 0) {
        this.showMessage("银行黑客攻击了你的账户，但被警察抓住了！你的存款安全。")
        return true
      }
    } else {
      const divisor = 2 + Math.floor(Math.random() * 10)
      loss = Math.floor(this.state.bankSavings / divisor)
    }

    this.state.bankSavings -= loss
    if (this.state.bankSavings < 0) {
      this.state.bankSavings = 0
    }

    this.showMessage(`银行黑客攻击了你的账户！你的存款减少了${loss.toLocaleString()}元，剩余${this.state.bankSavings.toLocaleString()}元`)
    return true
  }
}

