import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useGameStore } from '@/stores/game'
import { gameConfig } from '@/config/game.config'
import type { ChatMessage } from './useGameChat'
import type { GameState } from '@/types/game'

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
      
      addMessage({
        type: 'system',
        content: `🌅 第 ${currentTime} ${gameConfig.time.unit}开始了！`,
        icon: '🌅'
      }, true)
      
      setTimeout(() => {
        // 显示商品市场消息，但不自动打开抽屉
        // 用户需要自己点击"查看商品市场"来打开抽屉
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

