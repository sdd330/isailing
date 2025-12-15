import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useGameStore } from '@/stores/game'
import { gameConfig } from '@/config/game.config'
import type { ChatMessage } from './useGameChat'
import type { GameState } from '@/types/game'
import { getSolarTermForState } from '@/utils/season'

export function useGameTime(
  gameState: Ref<GameState>,
  addMessage: (msg: ChatMessage, stream?: boolean) => void,
  clearEvents: () => void,
  showMarket: (addMessage?: (msg: ChatMessage, stream?: boolean) => void, openDrawer?: () => void) => void,
  isProcessing: { value: boolean },
  clearChat?: () => void
) {
  const gameStore = useGameStore()

  const nextTime = () => {
    if (isProcessing.value) return
    
    try {
      isProcessing.value = true
      
      if (clearChat) {
        clearChat()
      }
      
      clearEvents()
      
      const currentTime = gameConfig.time.totalWeeks + 1 - gameState.value.timeLeft
      
      gameStore.nextTime()

      const term = getSolarTermForState(gameState.value, gameConfig)
      const seasonTextMap: Record<string, string> = {
        spring: '春季',
        summer: '夏季',
        autumn: '秋季',
        winter: '冬季'
      }
      const seasonText = seasonTextMap[term.season] || ''
      
      addMessage({
        type: 'system',
        content: `🌅 第 ${currentTime} ${gameConfig.time.unit}开始了！\n当前节气：${term.icon} ${term.name}${seasonText ? `（${seasonText}）` : ''}\n提示：${term.description}`,
        icon: '🌅'
      }, true)
      
      setTimeout(() => {
        // 显示商品黑市消息，但不自动打开抽屉
        // 用户需要自己点击"查看商品黑市"来打开抽屉
        showMarket(addMessage)
        isProcessing.value = false
      }, 2000)
    } catch (error) {
      isProcessing.value = false
      ElMessage.error(`执行下一${gameConfig.time.unit}时出错：` + (error as Error).message)
    }
  }

  return {
    nextTime
  }
}

