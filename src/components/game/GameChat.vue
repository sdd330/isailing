<template>
  <div ref="chatContainer" class="flex-1 overflow-hidden chat-content-area bg-gradient-to-b from-white/5 to-white/2">
    <div class="h-full flex flex-col">
      <!-- 使用 BubbleList 显示聊天消息 -->
      <div class="flex-1 overflow-hidden px-3 md:px-6 py-4 md:py-8">
        <BubbleList 
          :list="bubbleListData"
          :always-show-scrollbar="false"
          :show-back-button="true"
          :back-button-threshold="80"
          :default-typing="{ interval: 30, step: 2 }"
          :bubble-style="{
            maxWidth: 'min(90%, 720px)'
          }"
          trigger-indices="only-last"
          @complete="handleBubbleComplete"
        />
        
        <!-- 思考状态指示器 -->
        <div v-if="isProcessing" class="thinking-wrapper">
          <Thinking size="medium" color="#667eea" :duration="1500" />
        </div>
      </div>
      
      <!-- 选项按钮区域 -->
      <div v-if="currentOptions.length > 0" class="px-3 md:px-6 py-4 border-t border-white/10">
        <div class="max-w-4xl mx-auto space-y-2">
          <button
            v-for="(option, optionIndex) in currentOptions"
            :key="optionIndex"
            @click.stop.prevent="!option.disabled && $emit('option-click', option)"
            type="button"
            :disabled="option.disabled"
            :class="[
              'w-full px-4 py-3 rounded-lg text-left transition-all',
              'bg-white/10 hover:bg-white/20 backdrop-blur-sm',
              'border border-white/20',
              option.disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer'
            ]"
          >
            <span class="inline-block w-6 h-6 rounded-full bg-white/20 text-white text-sm font-bold mr-3 text-center leading-6">
              {{ optionIndex + 1 }}
            </span>
            <span class="text-white">{{ option.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ChatMessage as ChatMessageType, ChatOption } from '@/composables/useGameChat'

interface Props {
  chatHistory: ChatMessageType[]
  streamingMessageIndex: number | null
  isProcessing: boolean
}

const props = defineProps<Props>()

defineEmits<{
  'option-click': [option: ChatOption]
}>()

const chatContainer = ref<HTMLElement | null>(null)

// 转换为 BubbleList 需要的格式
const bubbleListData = computed(() => {
  // BubbleList 需要从旧到新的顺序，所以不需要反转
  return props.chatHistory.map((msg) => {
    // 处理消息内容（使用流式显示的内容或原始内容）
    const content = msg.displayedContent || msg.content
    
    return {
      content,
      role: msg.type === 'user' ? 'user' : 'bot',
      // 系统消息和事件消息启用打字机效果（流式消息不启用，因为已经在流式显示）
      typing: (msg.type === 'system' || msg.type === 'event') && !msg.isStreaming ? {
        interval: 30,
        step: 2
      } : undefined
    }
  })
})

// 获取当前最后一条消息的选项
const currentOptions = computed(() => {
  if (props.chatHistory.length === 0) return []
  const lastMessage = props.chatHistory[props.chatHistory.length - 1]
  return lastMessage?.options ?? []
})

const handleBubbleComplete = () => {
  // 气泡打字动画完成时的回调
}
</script>

<style scoped>
.chat-content-area {
  position: relative;
}

.thinking-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 12px 16px;
  margin-top: 8px;
  margin-left: 8px;
}

.thinking-wrapper :deep(.thinking) {
  animation: thinking-pulse 1.5s ease-in-out infinite;
}

@keyframes thinking-pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>

