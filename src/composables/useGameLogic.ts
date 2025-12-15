import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useGameStore } from '@/stores/game'
import { gameConfig } from '@/config/game.config'
import { availableCities, shanghaiTheme } from '@/config/theme.config'
import { useGameChat, type ChatOption } from './useGameChat'
import { useGameEvents } from './useGameEvents'
import { useGameActions } from './useGameActions'
import { useGameDialogs } from './useGameDialogs'
import { useGameOperations } from './useGameOperations'
import { useGameMenus } from './useGameMenus'
import { useGameTime } from './useGameTime'
import type { QuickAction } from './useGameKeyboard'
import { GoodsLibraryManager } from '@/core/managers/GoodsLibraryManager'

export function useGameLogic() {
  const gameStore = useGameStore()
  const { chatHistory, streamingMessageIndex, addMessage, clearChat } = useGameChat()
  const { timeEvents, clearEvents, addEvent, isRandomEvent } = useGameEvents()
  const { showMarket: showMarketAction, showBuildings, showTransportationMenu } = useGameActions()
  const dialogs = useGameDialogs()
  const dialogsRef = ref<{
    showBankDeposit: () => void
    showBankWithdraw: () => void
    showPostOffice: () => void
    showGameOver: () => void
    showHealthPointsDialog: () => void
    showQuantityDialog: (
      type: 'buy' | 'sell',
      goodsId: number,
      goodsName: string,
      unitPrice: number,
      ownedQuantity: number,
      maxQuantity: number
    ) => void
  } | null>(null)
  const marketDrawerRef = ref<{ open: () => void } | null>(null)
  const inventoryDrawerRef = ref<{ open: () => void } | null>(null)

  const gameState = computed(() => gameStore.gameState)
  const finalScore = computed(() => gameStore.finalScore)
  const isGameOver = computed(() => gameStore.gameState.isGameOver)
  const isProcessing = ref(false)

  const quickActions = computed<QuickAction[]>(() => [
    { id: 'market', label: '🏪 查看商品市场', shortLabel: '市场', icon: '🏪' },
    { id: 'buildings', label: '🏢 查看服务', shortLabel: '服务', icon: '🏢' },
    { id: 'inventory', label: '📦 查看我的商品', shortLabel: '我的', icon: '📦' },
    { id: 'next-time', label: `⏭️ 下一${gameConfig.time.unit}`, shortLabel: `下一${gameConfig.time.unit}`, icon: '⏭️' }
  ])

  const operations = useGameOperations(gameState, addMessage)
  const menus = useGameMenus(
    gameState,
    addMessage,
    () => {
      dialogs.bankAmount.value = Math.min(gameState.value.cash, Math.max(1000, Math.floor(gameState.value.cash * 0.1)))
      dialogsRef.value?.showBankDeposit()
    },
    () => {
      dialogs.bankAmount.value = Math.min(gameState.value.bankSavings, 1000)
      dialogsRef.value?.showBankWithdraw()
    },
    () => {
      dialogs.postAmount.value = Math.min(gameState.value.cash, gameState.value.debt)
      dialogsRef.value?.showPostOffice()
    },
    () => {
      dialogsRef.value?.showHealthPointsDialog()
    }
  )

  const timeLogic = useGameTime(
    gameState,
    addMessage,
    clearEvents,
    showMarketAction,
    isProcessing,
    clearChat
  )

  type OptionData = {
    goodsId?: number
    cityName?: string
    type?: 'train' | 'plane'
  }

  const handleOptionClick = (option: ChatOption) => {
    if (option.disabled) {
      return
    }
    
    const data = (option.data ?? {}) as OptionData

    switch (option.action) {
      case 'buy-goods':
        // 显示数量选择对话框
        if (!data.goodsId) {
          ElMessage.error('商品信息缺失！')
          break
        }
        const buyGoods = gameState.value.goods.find(g => g.id === data.goodsId)
        if (!buyGoods) {
          ElMessage.error('商品不存在！')
          break
        }
        if (buyGoods.price <= 0) {
          ElMessage.warning('该商品暂无价格，无法购买！')
          break
        }
        const maxBuyByCash = Math.floor(gameState.value.cash / buyGoods.price)
        const maxBuyByCapacity = gameState.value.maxCapacity - gameState.value.totalGoods
        const maxBuy = Math.min(maxBuyByCash, maxBuyByCapacity)
        if (maxBuy > 0) {
          dialogsRef.value?.showQuantityDialog(
            'buy',
            data.goodsId,
            buyGoods.name,
            buyGoods.price,
            0,
            maxBuy
          )
        } else {
          if (maxBuyByCash <= 0) {
            ElMessage.warning(`资金不足！需要 ${buyGoods.price.toLocaleString()}元，当前只有 ${gameState.value.cash.toLocaleString()}元`)
          } else {
            ElMessage.warning(`仓库已满！当前 ${gameState.value.totalGoods}/${gameState.value.maxCapacity}`)
          }
        }
        break
      case 'sell-goods':
        // 显示数量选择对话框
        if (!data.goodsId) {
          ElMessage.error('商品信息缺失！')
          break
        }
        const sellGoods = gameState.value.goods.find(g => g.id === data.goodsId)
        if (sellGoods && sellGoods.owned > 0) {
          dialogsRef.value?.showQuantityDialog(
            'sell',
            data.goodsId,
            sellGoods.name,
            sellGoods.price,
            sellGoods.owned,
            sellGoods.owned
          )
        }
        break
      case 'bank':
        menus.showBankMenu()
        break
      case 'bank-deposit':
        dialogs.bankAmount.value = Math.min(gameState.value.cash, Math.max(1000, Math.floor(gameState.value.cash * 0.1)))
        dialogsRef.value?.showBankDeposit()
        break
      case 'bank-withdraw':
        dialogs.bankAmount.value = Math.min(gameState.value.bankSavings, 1000)
        dialogsRef.value?.showBankWithdraw()
        break
      case 'hospital':
        menus.showHospitalMenu()
        break
      case 'delivery':
        operations.visitDelivery()
        break
      case 'construction-site':
        operations.visitConstructionSite()
        break
      case 'airport':
        showTransportationMenu(addMessage, 'plane')
        break
      case 'train-station':
        showTransportationMenu(addMessage, 'train')
        break
      case 'travel-select':
        addMessage({
          type: 'system',
          content: '选择交通方式前往其它城市：',
          icon: '🛫',
          options: [
            { label: '✈️ 飞机', action: 'travel-mode', data: { type: 'plane' } },
            { label: '🚄 高铁', action: 'travel-mode', data: { type: 'train' } }
          ]
        }, true)
        break
      case 'travel-mode':
        showTransportationMenu(addMessage, data.type === 'plane' ? 'plane' : 'train')
        break
      case 'travel':
        if (data.cityName) {
          handleCitySwitch(data.cityName, data.type || 'train')
        } else {
          ElMessage.error('城市信息缺失，无法前往')
          console.error('Travel option data:', option.data)
        }
        break
      case 'post-office':
        menus.showPostOfficeMenu()
        break
      case 'house-expand':
        operations.expandHouse()
        break
    }
  }

  const handleQuantityConfirm = (type: 'buy' | 'sell', goodsId: number, quantity: number) => {
    // 重新获取商品的最新信息，因为价格可能在对话框打开后发生了变化
    const goods = gameState.value.goods.find(g => g.id === goodsId)
    
    if (!goods) {
      ElMessage.error('商品不存在！')
      return
    }
    
    if (type === 'buy') {
      // 再次验证现金和仓库容量
      const totalCost = goods.price * quantity
      if (goods.price <= 0) {
        ElMessage.error('该商品暂无价格，无法购买！')
        return
      }
      if (gameState.value.cash < totalCost) {
        ElMessage.error(`现金不足！需要 ${totalCost.toLocaleString()}元，当前只有 ${gameState.value.cash.toLocaleString()}元`)
        return
      }
      if (gameState.value.totalGoods + quantity > gameState.value.maxCapacity) {
        ElMessage.error(`仓库容量不足！当前 ${gameState.value.totalGoods}/${gameState.value.maxCapacity}，无法再放入 ${quantity} 件商品`)
        return
      }
      operations.buyGoods(goodsId, quantity)
    } else {
      if (goods.owned < quantity) {
        ElMessage.error(`库存不足！只有 ${goods.owned} 件，无法出售 ${quantity} 件`)
        return
      }
      operations.sellGoods(goodsId, quantity)
    }
  }

  const handleHealthPointsConfirm = (points: number) => {
    // 再次验证现金和健康值
    const costPerPoint = gameConfig.buildings.hospital.costPerPoint
    const totalCost = points * costPerPoint
    const maxPoints = 100 - gameState.value.health
    
    if (points <= 0) {
      ElMessage.error('恢复点数必须大于0！')
      return
    }
    if (points > maxPoints) {
      ElMessage.error(`最多只能恢复 ${maxPoints} 点健康！`)
      return
    }
    if (gameState.value.cash < totalCost) {
      ElMessage.error(`现金不足！需要 ${totalCost.toLocaleString()}元，当前只有 ${gameState.value.cash.toLocaleString()}元`)
      return
    }
    
    operations.hospitalTreatment(points)
  }

  const handleCitySwitch = (cityName: string, transportationType: 'train' | 'plane' = 'train') => {
    if (!cityName) {
      ElMessage.error('城市名称不能为空')
      console.error('handleCitySwitch: cityName is empty')
      return
    }
    
    console.log('handleCitySwitch: 开始切换城市', { cityName, transportationType })
    
    // 先检查城市是否存在
    const cityInfo = availableCities.find(c => c.name === cityName)
    if (!cityInfo) {
      ElMessage.error(`找不到城市: ${cityName}`)
      console.error('handleCitySwitch: cityInfo not found for', cityName, 'available cities:', availableCities.map(c => c.name))
      return
    }
    
    const result = gameStore.switchCity(cityName, transportationType)
    console.log('handleCitySwitch: switchCity result', result)
    
    if (result) {
      const transportName = transportationType === 'train' ? '高铁' : '飞机'
      const transportIcon = transportationType === 'train' ? '🚄' : '✈️'
      
      // 更新商品数据为当前城市的配置
      updateGoodsForCity(cityInfo.theme)
      
      addMessage({
        type: 'system',
        content: `${transportIcon} 成功乘坐${transportName}前往${cityName}！\n当前城市：${cityName}\n已切换到${cityName}的商品市场。`,
        icon: transportIcon
      })
    } else {
      // switchCity 返回 false 时，CityManager 已经显示了错误消息
      // 但为了调试，我们添加更详细的日志
      console.error('handleCitySwitch: switchCity returned false', {
        cityName,
        transportationType,
        currentCity: gameState.value.currentCity,
        cash: gameState.value.cash,
        cityVisitsThisWeek: gameState.value.cityVisitsThisWeek
      })
    }
  }

  const updateGoodsForCity = (theme: typeof availableCities[0]['theme']) => {
    // 使用统一的商品库管理器来更新商品
    // 这会保留所有已拥有的商品，只更新商品的基础信息（basePrice, priceRange）
    const goodsLibrary = new GoodsLibraryManager()
    
    gameState.value.goods = goodsLibrary.updateGoodsForCity(gameState.value.goods, theme)
    
    // 重新计算总商品数
    gameState.value.totalGoods = gameState.value.goods.reduce((sum, g) => sum + (g.owned || 0), 0)
    
    // 重新初始化 GameEngine 以使用新城市的事件配置
    gameStore.reinitializeEngine(theme)
  }

  const handleQuickAction = (action: QuickAction) => {
    try {
      switch (action.id) {
        case 'market':
          marketDrawerRef.value?.open()
          break
        case 'inventory':
          inventoryDrawerRef.value?.open()
          break
        case 'buildings':
          showBuildings(addMessage)
          break
        case 'next-time':
          timeLogic.nextTime()
          break
      }
    } catch (error) {
      ElMessage.error('操作失败：' + (error as Error).message)
    }
  }

  const handleBankDeposit = (amount: number) => {
    if (gameStore.bankDeposit(amount)) {
      ElMessage.success(`成功存款 ${amount.toLocaleString()}元！`)
      addMessage({
        type: 'system',
        content: `✅ 存款成功：${amount.toLocaleString()}元\n当前现金：${gameState.value.cash.toLocaleString()}元\n银行存款：${gameState.value.bankSavings.toLocaleString()}元`,
        icon: '✅'
      })
    }
  }

  const handleBankWithdraw = (amount: number) => {
    if (gameStore.bankWithdraw(amount)) {
      ElMessage.success(`成功取款 ${amount.toLocaleString()}元！`)
      addMessage({
        type: 'system',
        content: `✅ 取款成功：${amount.toLocaleString()}元`,
        icon: '✅'
      })
    }
  }

  const handlePostOfficePayment = (amount: number) => {
    if (gameStore.postOfficePayment(amount)) {
      ElMessage.success(`成功偿还 ${amount.toLocaleString()}元债务！`)
    }
  }

  const restartGame = () => {
    gameStore.initializeGame()
    clearChat()
    clearEvents()
    const cityInfo = availableCities.find(c => c.name === gameState.value.currentCity)
    const theme = cityInfo?.theme || shanghaiTheme
    addMessage({
      type: 'system',
      content: `🔄 游戏重新开始！欢迎来到${theme.city.name}！`,
      icon: '🎮'
    })
  }

  watch(isGameOver, (newValue) => {
    if (newValue) {
      dialogsRef.value?.showGameOver()
    }
  })

      return {
        gameState,
        finalScore,
        isGameOver,
        isProcessing,
        chatHistory,
        streamingMessageIndex,
        timeEvents,
        quickActions,
        dialogs,
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
        marketDrawerRef,
        inventoryDrawerRef
      }
}

