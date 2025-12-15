import { ref, computed } from 'vue'

export interface ChatMessage {
  type: 'system' | 'user' | 'event'
  content: string
  icon?: string
  options?: ChatOption[]
  isImportant?: boolean
  isStreaming?: boolean
  displayedContent?: string
}

export interface ChatOption {
  label: string
  action: string
  data?: unknown
  disabled?: boolean
}

export function useGameChat() {
  const chatHistory = ref<ChatMessage[]>([])
  const streamingMessageIndex = ref<number | null>(null)
  const streamingTimer = ref<number | null>(null)

  const reversedChatHistory = computed(() => {
    const reversed = [...chatHistory.value]
    reversed.reverse()
    return reversed
  })

  const addMessage = (message: ChatMessage, stream: boolean = false) => {
    const index = chatHistory.value.length
    chatHistory.value.push({
      ...message,
      displayedContent: stream ? '' : message.content,
      isStreaming: stream
    })

    if (stream) {
      streamingMessageIndex.value = index
      startStreaming(index, message.content)
    }
  }

  const startStreaming = (index: number, content: string, speed: number = 30) => {
    const message = chatHistory.value[index]
    if (!message) return

    let charIndex = 0

    const stream = () => {
      if (charIndex < content.length) {
        message.displayedContent = content.substring(0, charIndex + 1)
        charIndex++
      } else {
        message.isStreaming = false
        streamingMessageIndex.value = null
        if (streamingTimer.value !== null) {
          clearInterval(streamingTimer.value)
          streamingTimer.value = null
        }
      }
    }

    stream()

    if (streamingTimer.value !== null) {
      clearInterval(streamingTimer.value)
    }

    streamingTimer.value = window.setInterval(stream, speed)
  }

  const clearChat = () => {
    chatHistory.value = []
    if (streamingTimer.value !== null) {
      clearInterval(streamingTimer.value)
      streamingTimer.value = null
    }
  }

  return {
    chatHistory,
    reversedChatHistory,
    streamingMessageIndex,
    addMessage,
    clearChat
  }
}

