import { gameConfig } from '@/config/game.config'
import type { ChatMessage } from './useGameChat'
import type { Ref } from 'vue'
import type { GameState } from '@/types/game'

export function useGameMenus(
  gameState: Ref<GameState>,
  addMessage: (msg: ChatMessage, stream?: boolean) => void,
  showBankDeposit: () => void,
  showBankWithdraw: () => void,
  showPostOffice: () => void,
  showHealthPointsDialog?: () => void
) {
  const showBankMenu = () => {
    addMessage({
      type: 'system',
      content: `🏦 银行服务：
当前现金: ${gameState.value.cash.toLocaleString()}元
银行存款: ${gameState.value.bankSavings.toLocaleString()}元

选择操作：`,
      icon: '🏦',
      options: [
        { label: '💰 存款', action: 'bank-deposit' },
        { label: '💸 取款', action: 'bank-withdraw' }
      ]
    }, true)
  }

  const showHospitalMenu = () => {
    if (gameState.value.health >= 100) {
      addMessage({
        type: 'system',
        content: '🏥 你的健康状态良好，不需要治疗。',
        icon: '🏥'
      }, true)
      return
    }
    
    const costPerPoint = gameConfig.buildings.hospital.costPerPoint
    const availableCash = gameState.value.cash
    
    // 检查是否有足够的现金
    if (availableCash < costPerPoint) {
      addMessage({
        type: 'system',
        content: `🏥 医院治疗：
当前健康: ${gameState.value.health}/100
治疗费用: 每点健康 ${costPerPoint.toLocaleString()}元

❌ 现金不足！至少需要 ${costPerPoint.toLocaleString()}元才能恢复1点健康。
当前现金: ${availableCash.toLocaleString()}元`,
        icon: '🏥'
      }, true)
      return
    }
    
    // 显示健康点数输入对话框
    if (showHealthPointsDialog) {
      showHealthPointsDialog()
    } else {
      // 如果没有提供对话框方法，显示提示信息
      addMessage({
        type: 'system',
        content: `🏥 医院治疗：
当前健康: ${gameState.value.health}/100
治疗费用: 每点健康 ${costPerPoint.toLocaleString()}元
当前现金: ${availableCash.toLocaleString()}元

请点击医院选项来输入要恢复的健康点数。`,
        icon: '🏥'
      }, true)
    }
  }

  const showPostOfficeMenu = () => {
    if (gameState.value.debt === 0) {
      const totalAssets = gameState.value.cash + gameState.value.bankSavings
      let message = ''
      if (totalAssets < 1000) {
        message = '村长笑呵呵地说："小伙子，你没钱，别瞎忙!"'
      } else if (totalAssets < 100000) {
        message = '村长摇摇头说："兄弟，先支援你1000元。"'
      } else if (totalAssets < 10000000) {
        message = '村长在电话中高兴地说："恭喜！你的女儿真漂亮。"...'
      } else {
        message = '村长在电话中激动地说："你简直是神一样的存在"'
      }
      addMessage({
        type: 'system',
        content: `📬 邮局：\n${message}`,
        icon: '📬'
      }, true)
      return
    }
    
    showPostOffice()
  }

  return {
    showBankMenu,
    showHospitalMenu,
    showPostOfficeMenu
  }
}

