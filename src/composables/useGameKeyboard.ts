import { onMounted, onUnmounted } from 'vue'
import type { ChatOption, ChatMessage } from './useGameChat'

export interface QuickAction {
  id: string
  label: string
  shortLabel: string
  icon: string
}

export function useGameKeyboard(
  quickActions: QuickAction[],
  handleOptionClick: (option: ChatOption) => void,
  handleQuickAction: (action: QuickAction) => void,
  chatHistory: { value: ChatMessage[] }
) {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key >= '1' && e.key <= '5') {
      const num = parseInt(e.key)
      const lastMessage = chatHistory.value[chatHistory.value.length - 1]
      const option = lastMessage?.options?.[num - 1]
      if (option) {
        handleOptionClick(option)
      }
    }

    const keyMap: Record<string, string> = {
      'm': 'market',
      'M': 'market',
      'i': 'inventory',
      'I': 'inventory',
      'b': 'buildings',
      'B': 'buildings',
      'n': 'next-time',
      'N': 'next-time'
    }

    const actionId = keyMap[e.key]
    if (actionId) {
      const action = quickActions.find(a => a.id === actionId)
      if (action) {
        handleQuickAction(action)
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyPress)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress)
  })
}

