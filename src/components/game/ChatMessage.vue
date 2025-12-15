<template>
  <div :class="['flex message-enter-active', isMobile ? 'gap-2' : 'gap-4', props.message.type === 'user' ? 'justify-end' : '']">
    <template v-if="props.message.type === 'system' || props.message.type === 'event'">
      <el-avatar 
        :size="isMobile ? 32 : 40" 
        :class="[
          'flex-shrink-0 shadow-lg',
          props.message.type === 'event' 
            ? 'bg-gradient-to-br from-orange-500 to-red-500 animate-pulse' 
            : 'bg-gradient-to-br from-blue-500 to-purple-500'
        ]"
      >
        <span :class="['text-white', isMobile ? 'text-sm' : 'text-lg']">{{ props.message.icon }}</span>
      </el-avatar>
      <el-card 
        :class="[
          'glass-effect message-bubble message-card',
          isMobile ? 'max-w-[85%]' : 'max-w-[80%]',
          props.message.type === 'event' ? 'event-message' : '',
          props.message.isStreaming ? 'streaming-message' : ''
        ]" 
        shadow="never" 
        :body-style="isMobile ? 'padding: 12px;' : 'padding: 20px;'"
      >
        <p :class="[
          'text-gray-800 whitespace-pre-line m-0', 
          isMobile ? 'text-sm leading-normal' : 'leading-relaxed',
          props.message.type === 'event' ? 'font-semibold' : ''
        ]">
          {{ props.message.displayedContent || props.message.content }}
          <span v-if="props.message.isStreaming" class="streaming-cursor">▊</span>
        </p>
        <div v-if="props.message.options" :class="['flex flex-col w-full relative z-10', isMobile ? 'gap-1.5 mt-2' : 'gap-2 mt-4']">
          <button
            v-for="(option, optionIndex) in props.message.options"
            :key="optionIndex"
            @click.stop.prevent="handleOptionClick(option)"
            type="button"
            :disabled="option.disabled"
            :class="[
              isMobile ? 'btn-option-mobile' : 'btn-option', 
              'relative z-11 touch-manipulation',
              option.disabled 
                ? 'opacity-50 cursor-not-allowed pointer-events-none' 
                : 'pointer-events-auto cursor-pointer'
            ]"
          >
            <span :class="isMobile ? 'option-number-mobile' : 'option-number'">
              {{ optionIndex + 1 }}
            </span>
            <span class="flex-1 text-left leading-relaxed break-words">
              {{ option.label }}
            </span>
          </button>
        </div>
      </el-card>
    </template>

    <template v-if="props.message.type === 'user'">
      <el-card 
        :class="['glass-effect message-bubble message-card user-message', isMobile ? 'max-w-[85%]' : 'max-w-[80%]']" 
        shadow="never" 
        :body-style="isMobile ? 'padding: 12px;' : 'padding: 20px;'"
      >
        <p :class="['text-white m-0', isMobile ? 'text-sm leading-normal' : 'leading-relaxed']">{{ props.message.content }}</p>
      </el-card>
      <el-avatar :size="isMobile ? 32 : 40" class="bg-gradient-to-br from-gray-600 to-gray-700 flex-shrink-0 shadow-lg">
        👤
      </el-avatar>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, ChatOption } from '@/composables/useGameChat'
import { useMobile } from '@/composables/useMobile'

interface Props {
  message: ChatMessage
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'option-click': [option: ChatOption]
}>()

const { isMobile } = useMobile()

const handleOptionClick = (option: ChatOption) => {
  if (option.disabled) {
    return
  }
  console.log('ChatMessage: option clicked', option)
  emit('option-click', option)
}
</script>

