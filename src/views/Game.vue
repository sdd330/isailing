<template>
  <div class="game-chat min-h-screen flex flex-col">
    <GameDialogs
      :game-state="gameState"
      :final-score="finalScore"
      @restart="restartGame"
      @bank-deposit="handleBankDeposit"
      @bank-withdraw="handleBankWithdraw"
      @post-office-payment="handlePostOfficePayment"
      @quantity-confirm="handleQuantityConfirm"
      @health-points-confirm="handleHealthPointsConfirm"
      ref="localDialogsRef"
    />

    <GameHeader
      :game-state="gameState"
      :final-score="finalScore"
      :time-events="timeEvents"
    />

    <GameChat
      :chat-history="chatHistory"
      :streaming-message-index="streamingMessageIndex"
      :is-processing="isProcessing"
      @option-click="handleOptionClick"
    />

    <GameFooter
      :quick-actions="quickActions"
      :is-processing="isProcessing"
      @quick-action="handleQuickAction"
    />

    <MarketDrawer
      v-model="marketDrawerVisible"
      @buy="handleMarketBuy"
      ref="marketDrawerRef"
    />

    <InventoryDrawer
      v-model="inventoryDrawerVisible"
      @sell="handleInventorySell"
      ref="inventoryDrawerRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useGameStore } from '@/stores/game'
import { gameConfig } from '@/config/game.config'
import { currentTheme } from '@/config/theme.config'
import { useGameLogic } from '@/composables/useGameLogic'
import { useGameKeyboard } from '@/composables/useGameKeyboard'
import GameDialogs from '@/components/game/GameDialogs.vue'
import GameHeader from '@/components/game/GameHeader.vue'
import GameChat from '@/components/game/GameChat.vue'
import GameFooter from '@/components/game/GameFooter.vue'
import MarketDrawer from '@/components/game/MarketDrawer.vue'
import InventoryDrawer from '@/components/game/InventoryDrawer.vue'

defineOptions({ name: 'GameView' })

const gameStore = useGameStore()
const localDialogsRef = ref<InstanceType<typeof GameDialogs> | null>(null)
const marketDrawerRef = ref<InstanceType<typeof MarketDrawer> | null>(null)
const marketDrawerVisible = ref(false)
const inventoryDrawerRef = ref<InstanceType<typeof InventoryDrawer> | null>(null)
const inventoryDrawerVisible = ref(false)
const {
  gameState,
  finalScore,
  isGameOver,
  isProcessing,
  chatHistory,
  streamingMessageIndex,
  timeEvents,
  quickActions,
  dialogsRef,
  addMessage,
  addEvent,
  isRandomEvent,
  handleOptionClick,
  handleQuickAction,
  handleBankDeposit,
  handleBankWithdraw,
  handlePostOfficePayment,
  handleQuantityConfirm,
  handleHealthPointsConfirm,
  restartGame,
  marketDrawerRef: logicMarketDrawerRef,
  inventoryDrawerRef: logicInventoryDrawerRef
} = useGameLogic()

// 同步 marketDrawerRef 到 useGameLogic
watch(marketDrawerRef, (newVal) => {
  if (newVal && logicMarketDrawerRef) {
    logicMarketDrawerRef.value = newVal
  }
}, { immediate: true })

// 同步 inventoryDrawerRef 到 useGameLogic
watch(inventoryDrawerRef, (newVal) => {
  if (newVal && logicInventoryDrawerRef) {
    logicInventoryDrawerRef.value = newVal
  }
}, { immediate: true })

const handleMarketBuy = (goodsId: number) => {
  // 触发购买操作，使用数量选择对话框
  const goods = gameState.value.goods.find(g => g.id === goodsId)
  if (!goods) {
    return
  }
  if (goods.price <= 0) {
    return
  }
  const maxBuyByCash = Math.floor(gameState.value.cash / goods.price)
  const maxBuyByCapacity = gameState.value.maxCapacity - gameState.value.totalGoods
  const maxBuy = Math.min(maxBuyByCash, maxBuyByCapacity)
  if (maxBuy > 0) {
    localDialogsRef.value?.showQuantityDialog(
      'buy',
      goodsId,
      goods.name,
      goods.price,
      0,
      maxBuy
    )
  }
}

const handleInventorySell = (goodsId: number) => {
  // 触发出售操作，使用数量选择对话框
  const goods = gameState.value.goods.find(g => g.id === goodsId)
  if (!goods) {
    return
  }
  if (goods.price <= 0) {
    return
  }
  if (goods.owned <= 0) {
    return
  }
  const maxSell = goods.owned
  if (maxSell > 0) {
    localDialogsRef.value?.showQuantityDialog(
      'sell',
      goodsId,
      goods.name,
      goods.price,
      goods.owned,
      maxSell
    )
  }
}

gameStore.setMessageHandler((message: string) => {
  if (isRandomEvent(message)) {
    addEvent(message)
    return
  }
  
  addMessage({
    type: 'system',
    content: message,
    icon: '💬'
  }, false)
})

// 同步 localDialogsRef 到 useGameLogic 的 dialogsRef
watch(localDialogsRef, (newVal) => {
  if (newVal && dialogsRef) {
    dialogsRef.value = newVal
  }
}, { immediate: true })

onMounted(() => {
  gameStore.initializeGame()
  
  nextTick(() => {
    addMessage({
      type: 'system',
      content: `🎮 欢迎来到《${currentTheme.game.title}》！\n\n你是一名刚到${currentTheme.city.name}的创业者，你有 ${gameState.value.cash.toLocaleString()}元现金和 ${gameState.value.debt.toLocaleString()}元债务。\n\n你需要在${gameConfig.time.totalWeeks}${gameConfig.time.unit}（${gameConfig.time.unitDescription}）内积累财富，还清债务，成为一名成功的企业家！\n\n💡 操作提示：\n• 点击快捷按钮来操作游戏\n• 使用数字键 1-4 快速选择选项\n• 快捷键：M(市场) I(库存) B(建筑) N(下一${gameConfig.time.unit})`,
      icon: '🎉'
    }, true)
  })
  
  watch(isGameOver, (newValue) => {
    if (newValue) {
      dialogsRef.value?.showGameOver()
    }
  })
  
  useGameKeyboard(
    quickActions.value,
    handleOptionClick,
    handleQuickAction,
    chatHistory
  )
})
</script>
