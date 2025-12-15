import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useGameStore } from '@/stores/game'
import { gameConfig } from '@/config/game.config'
import { getAvailableCities, getCity, getCityKeyByName, configManager } from '@/config/theme.config'
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
    { id: 'market', label: '🏪 查看商品黑市', shortLabel: '黑市', icon: '🏪' },
    { id: 'services', label: '🏢 查看服务', shortLabel: '服务', icon: '🏢' },
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
    houseTypeId?: string
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
      case 'construction-site':
        operations.showWorkTypeMenu()
        break
      case 'work-type':
        // 处理工作类型选择
        if (data?.type) {
          operations.doWork(data.type)
        }
        break
      case 'airport':
        // 旧的直接机场入口已废弃，引导玩家通过地铁前往
        addMessage({
          type: 'system',
          content: '请先通过“出行（地铁）”前往机场，再选择飞机出行。',
          icon: '🚇'
        }, true)
        break
      case 'train-station':
        // 旧的直接火车站入口已废弃，引导玩家通过地铁前往
        addMessage({
          type: 'system',
          content: '请先通过“出行（地铁）”前往火车站，再选择高铁出行。',
          icon: '🚇'
        }, true)
        break
      case 'travel-select':
        // 统一走 subway-travel 逻辑
        addMessage({
          type: 'system',
          content: '请通过“出行（地铁）”前往火车站或机场，再选择高铁 / 飞机。',
          icon: '🚇'
        }, true)
        break
      case 'travel-mode': {
        const result = showTransportationMenu(data.type === 'plane' ? 'plane' : 'train')
        dialogsRef.value?.showTravelDialog(result)
        addMessage({
          type: 'system',
          content: `${result.transportIcon} 请选择要前往的城市（${result.transportName}），已在弹出的面板中列出各城市票价。`,
          icon: result.transportIcon
        }, true)
        break
      }
      case 'travel':
        if (data.cityName) {
          const cost = typeof data.cost === 'number' ? data.cost : 0
          if (cost <= 0) {
            ElMessage.error('路线配置有误，无法计算出行费用')
            console.error('Invalid travel cost data:', option.data)
            break
          }
          handleCitySwitch(data.cityName, data.type || 'train')
        } else {
          ElMessage.error('城市信息缺失，无法前往')
          console.error('Travel option data:', option.data)
        }
        break
      case 'post-office':
        menus.showPostOfficeMenu()
        break
      case 'restaurant': {
        const ok = operations.eatAtRestaurant()
        if (!ok) {
          // BuildingManager 里已经给出具体文案，这里不用重复提示
        }
        break
      }
      case 'house-menu':
        operations.showHouseTypeMenu()
        break
      case 'house-rent':
        if (data?.houseTypeId) {
          operations.rentHouse(data.houseTypeId)
        }
        break
      case 'subway':
      case 'subway-travel': {
        // 通过地铁在本市不同地点之间移动（使用弹窗标签选择目的地）
        const currentCityName = gameState.value.currentCity || '上海'
        const cityKeyForLocations = getCityKeyByName(currentCityName)
        const currentCityConfig = getCity(cityKeyForLocations) || getCity('shanghai')
        const locations = currentCityConfig ? currentCityConfig.getLocations() : []

        // 为 UI 添加地铁票价（所有目的地票价相同，以当前城市地铁票价为准）
        const subwayFare = configManager.getSubwayFare(cityKeyForLocations)
        const locationsWithFare = locations.map(loc => ({
          ...loc,
          meta: { ...(loc as any).meta, fare: subwayFare }
        }))

        dialogsRef.value?.showSubwayDialog(locationsWithFare)
        addMessage({
          type: 'system',
          content: '🚇 你来到了地铁入口，请从弹出的面板中选择要前往的地点。',
          icon: '🚇'
        }, true)
        break
      }
      case 'move-location':
        if (typeof data.locationId === 'number') {
          const currentCityName = gameState.value.currentCity || '上海'
          const cityKeyForLocations = getCityKeyByName(currentCityName || '上海')
          const currentCityConfig = getCity(cityKeyForLocations) || getCity('shanghai')
          const locations = currentCityConfig ? currentCityConfig.getLocations() : []
          const targetLocation = locations.find(loc => loc.id === data.locationId)
          const locationName = data.locationName || targetLocation?.name || '新的地点'

          // 如果该地点配置了跨城通道（如花桥站），则通过该通道直接跨城
          if (targetLocation && targetLocation.intercityTunnel) {
            const tunnel = targetLocation.intercityTunnel
            const tunnelType = tunnel.type || 'train'
            const baseFare = configManager.getSubwayFare(cityKeyForLocations)
            const tunnelFare = baseFare // 地铁互通按正常地铁票价计算

            if (gameState.value.cash < tunnelFare) {
              ElMessage.error(`现金不足，无法支付 ${tunnelFare.toLocaleString()} 元的跨城地铁票价`)
              break
            }

            gameState.value.cash -= tunnelFare
            handleCitySwitch(tunnel.targetCity, tunnelType, {
              viaTunnelName: targetLocation.name,
              skipCost: true
            })
            // 花桥地铁互通同样有机会触发地铁随机事件（按目标城市计算）
            maybeTriggerSubwayEvent(tunnel.targetCity)
            break
          }

          // 普通同城地铁移动：按本城地铁票价扣费 & 消耗体力
          const baseFare = configManager.getSubwayFare(cityKeyForLocations)
          const staminaCost = 3

          if (gameState.value.stamina <= 0) {
            ElMessage.warning('你已经精疲力尽了，先休息或去饭店吃点东西再到处跑吧。')
            break
          }

          if (baseFare > 0) {
            if (gameState.value.cash < baseFare) {
              ElMessage.error(`现金不足，无法支付 ${baseFare.toLocaleString()} 元的地铁票价`)
              break
            }
            gameState.value.cash -= baseFare
          }

          // 消耗体力
          gameState.value.stamina = Math.max(0, gameState.value.stamina - staminaCost)

          gameState.value.currentLocation = data.locationId

          addMessage({
            type: 'system',
            content: `🚇 你乘坐地铁来到了${locationName}。${baseFare > 0 ? `本次地铁花费 ${baseFare.toLocaleString()} 元。` : ''}`,
            icon: '🚇'
          })

          // 每次地铁移动都有概率触发一次轻量健康 / 金钱事件
          maybeTriggerSubwayEvent(currentCityName)

          // 如果城市配置里显式标记了交通枢纽字段，优先使用显式字段
          const anyFlagged = locations.some(loc => loc.isAirport || loc.isTrainStation)
          const showTravelChoice = (mode: 'plane' | 'train') => {
            const icon = mode === 'plane' ? '✈️' : '🚄'
            const label = mode === 'plane' ? '坐飞机出城' : '坐高铁出城'
            addMessage({
              type: 'system',
              content: `${icon} 你现在在${locationName}，可以选择${label}：`,
              icon,
              options: [
                {
                  label: `${icon} ${label}`,
                  action: 'travel-mode',
                  data: { type: mode }
                }
              ]
            }, true)
          }

          if (anyFlagged && targetLocation) {
            // 同一个地点既是高铁站又是机场（如上海虹桥枢纽），给出两个选项
            if (targetLocation.isAirport && targetLocation.isTrainStation) {
              addMessage({
                type: 'system',
                content: `你现在在${locationName}，这里既有高铁站也有机场，选择你的出城方式：`,
                icon: '🛫',
                options: [
                  {
                    label: '✈️ 坐飞机出城',
                    action: 'travel-mode',
                    data: { type: 'plane' }
                  },
                  {
                    label: '🚄 坐高铁出城',
                    action: 'travel-mode',
                    data: { type: 'train' }
                  }
                ]
              }, true)
            } else if (targetLocation.isAirport) {
              showTravelChoice('plane')
            } else if (targetLocation.isTrainStation) {
              showTravelChoice('train')
            }
          }
        } else {
          ElMessage.error('地点信息缺失，无法前往')
        }
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
    const costPerPoint = gameConfig.buildings.hospital.costPerPoint ?? 350
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

  /**
   * 地铁途中随机小事件：同时触发健康事件和金钱事件
   */
  const maybeTriggerSubwayEvent = (currentCityName: string) => {
    // 15% 概率触发事件
    if (Math.random() > 0.15) return

    const cityKey = getCityKeyByName(currentCityName || '上海')

    // 触发健康事件
    const healthEvents = configManager.getRandomEvents(cityKey, 'health') as any[]
    if (healthEvents && healthEvents.length > 0) {
      const event = healthEvents[Math.floor(Math.random() * healthEvents.length)]
      if (event && event.damage) {
        const damage = Math.max(1, Math.floor(event.damage))
        gameState.value.health = Math.max(0, gameState.value.health - damage)

        addMessage({
          type: 'system',
          content: `🚑 ${event.message}（地铁途中）\n健康 -${damage}`,
          icon: '🚑'
        })

        // 检查健康值是否为0导致游戏结束
        if (gameState.value.health <= 0) {
          // 延迟一下再检查游戏结束，避免与当前操作冲突
          setTimeout(() => {
            const gameStore = useGameStore()
            if (gameStore.gameEngine) {
              gameStore.gameEngine.checkHealthGameOver()
            }
          }, 100)
        }
      }
    }

    // 触发金钱事件
    const moneyEvents = configManager.getRandomEvents(cityKey, 'money') as any[]
    if (moneyEvents && moneyEvents.length > 0) {
      const event = moneyEvents[Math.floor(Math.random() * moneyEvents.length)]
      if (event) {
        // 优先使用 cashMultiplier 做一个"几元 ~ 几十元"的小额变化
        let delta = 0
        if (typeof event.cashMultiplier === 'number' && event.cashMultiplier !== 0) {
          // 视为一个相对小的百分比，避免一次扣太多
          const rate = Math.min(10, Math.abs(event.cashMultiplier)) // 最高按 10%
          delta = Math.floor((gameState.value.cash / 100) * rate)
          if (delta <= 0) {
            delta = Math.max(5, Math.abs(event.cashMultiplier))
          }
          if (event.cashMultiplier > 0) {
            // 负向事件：扣钱
            delta = -delta
          }
        } else {
          // 没有 cashMultiplier 时，给一个固定小金额波动
          delta = (Math.random() < 0.5 ? -1 : 1) * Math.max(5, Math.floor(Math.random() * 30))
        }

        if (delta !== 0) {
          const before = gameState.value.cash
          let after = before + delta
          if (after < 0) after = 0
          gameState.value.cash = after

          const absDelta = Math.abs(delta)
          const deltaText = delta > 0 ? `赚了 ${absDelta.toLocaleString()} 元！` : `损失了 ${absDelta.toLocaleString()} 元。`

          addMessage({
            type: 'system',
            content: `💰 ${event.message}（地铁途中），${deltaText}`,
            icon: '💰'
          })
        }
      }
    }
  }

  const handleCitySwitch = (
    cityName: string,
    transportationType: 'train' | 'plane' = 'train',
    options?: { viaTunnelName?: string; skipCost?: boolean }
  ) => {
    if (!cityName) {
      ElMessage.error('城市名称不能为空')
      console.error('handleCitySwitch: cityName is empty')
      return
    }
    
    console.log('handleCitySwitch: 开始切换城市', { cityName, transportationType })
    
    // 先检查城市是否存在
    const allCities = getAvailableCities()
    const cityInfo = allCities.find(c => c.name === cityName)
    if (!cityInfo) {
      ElMessage.error(`找不到城市: ${cityName}`)
      console.error('handleCitySwitch: cityInfo not found for', cityName, 'available cities:', allCities.map(c => c.name))
      return
    }
    
    const prevCityName = gameState.value.currentCity
    const result = gameStore.switchCity(cityName, transportationType, {
      skipCost: options?.skipCost
    })
    console.log('handleCitySwitch: switchCity result', result)
    
    if (result) {
      const transportName = transportationType === 'train' ? '高铁' : '飞机'
      const transportIcon = transportationType === 'train' ? '🚄' : '✈️'
      const isTunnelRoute = !!options?.viaTunnelName
      
      // 更新商品数据为当前城市的配置（cityName 为中文名，这里交给 updateGoodsForCity 处理映射）
      updateGoodsForCity(cityName)
      
      if (isTunnelRoute) {
        // 跨城通道：根据目标城市配置中同名地点设置当前位置
        const targetCityKey = getCityKeyByName(cityName)
        const targetCityConfig = getCity(targetCityKey) || getCity('shanghai')
        const targetLocations = targetCityConfig ? targetCityConfig.getLocations() : []
        const tunnelLocationInTarget = targetLocations.find(l => l.name === options?.viaTunnelName)
        if (tunnelLocationInTarget) {
          gameState.value.currentLocation = tunnelLocationInTarget.id
        }
        addMessage({
          type: 'system',
          content: `🚇 你通过${options.viaTunnelName}完成跨城，从${prevCityName}进入${cityName}。\n当前城市：${cityName} · ${options.viaTunnelName}\n已切换到${cityName}的商品黑市。`,
          icon: '🚇'
        })
      } else {
        addMessage({
          type: 'system',
          content: `${transportIcon} 成功乘坐${transportName}前往${cityName}！\n当前城市：${cityName}\n已切换到${cityName}的商品黑市。`,
          icon: transportIcon
        })
      }
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

  const updateGoodsForCity = (cityName: string) => {
    // 将城市中文名转换为配置键
    const cityKey = getCityKeyByName(cityName)
    const city = getCity(cityKey)
    if (!city) return

    // 使用统一的商品库管理器来更新商品
    // 这会保留所有已拥有的商品，只更新商品的基础信息（basePrice, priceRange）
    const goodsLibrary = new GoodsLibraryManager()

    // 创建兼容的主题对象用于商品库管理器
    const theme = {
      goods: city.getGoods(),
      city: {
        name: city.getCityName(),
        shortName: city.getShortName()
      }
    }

    const cityKeyForUpdate = getCityKeyByName(theme.city.name)
    gameState.value.goods = goodsLibrary.updateGoodsForCity(gameState.value.goods, cityKeyForUpdate)

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
        case 'services':
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
    const currentCity = getCity(gameState.value.currentCity?.toLowerCase() || 'shanghai')
    const cityName = currentCity?.getCityName() || '上海'
    addMessage({
      type: 'system',
      content: `🔄 游戏重新开始！欢迎来到${cityName}！`,
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

