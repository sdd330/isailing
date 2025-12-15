import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { gameConfig } from '@/config/game.config'
import { availableCities, shanghaiTheme } from '@/config/theme.config'
import type { ChatMessage } from './useGameChat'
import { debugLog, debugError } from '@/utils/debug'

export function useGameActions() {
  const gameStore = useGameStore()
  const gameState = computed(() => gameStore.gameState)

  // 获取当前城市的主题配置，用于获取随机事件相关的商品
  const getCurrentCityTheme = () => {
    const cityInfo = availableCities.find(c => c.name === gameState.value.currentCity)
    return cityInfo?.theme || availableCities[0]?.theme || shanghaiTheme
  }

  const ownedGoods = computed(() => 
    gameState.value.goods.filter(g => g.owned > 0)
  )

  const showMarket = (addMessage?: (msg: ChatMessage, stream?: boolean) => void, openDrawer?: () => void) => {
    // 如果提供了打开抽屉的函数，则打开抽屉
    if (openDrawer) {
      openDrawer()
      return
    }
    
    // 如果提供了 addMessage，则显示商品市场消息（不带购买选项）
    if (addMessage) {
      const theme = getCurrentCityTheme()
      const marketManager = gameStore.marketManager
      const marketInfo = marketManager.getMarketInfo(theme)

      const marketText = marketManager.formatMarketText(marketInfo)

      addMessage({
        type: 'system',
        content: marketText,
        icon: '🏪'
      }, true)
    }
  }

  const showInventory = (addMessage: (msg: ChatMessage, stream?: boolean) => void) => {
    if (ownedGoods.value.length === 0) {
      addMessage({
        type: 'system',
        content: '📦 你目前没有持有任何商品。',
        icon: '📦'
      }, true)
      return
    }

    let inventoryText = '📦 你的商品库存：\n\n'
    ownedGoods.value.forEach(goods => {
      const priceText = goods.price > 0 
        ? `当前价格: ${goods.price.toLocaleString()}元`
        : '暂无价格'
      inventoryText += `${goods.name}: ${goods.owned}件 (${priceText})\n`
    })

    addMessage({
      type: 'system',
      content: inventoryText,
      icon: '📦',
      options: ownedGoods.value
        .filter(goods => goods.owned > 0)
        .map(goods => ({
          label: goods.price > 0 
            ? `出售 ${goods.name} (${goods.price}元/件)`
            : `出售 ${goods.name} (暂无价格)`,
          action: 'sell-goods',
          data: { goodsId: goods.id, quantity: 1 },
          disabled: goods.price === 0
        }))
    }, true)
  }

  const getTransportationCost = (fromCity: string, toCity: string, type: 'train' | 'plane'): number => {
    if (!gameConfig.transportation || !gameConfig.transportation[type]) {
      debugError(`交通配置不存在: transportation.${type}`)
      return 0
    }
    
    const costs = gameConfig.transportation[type]
    
    const cityMap: Record<string, string> = {
      '北京': 'beijing',
      '上海': 'shanghai',
      '广州': 'guangzhou'
    }
    
    const fromKey = cityMap[fromCity]
    const toKey = cityMap[toCity]
    
    if (!fromKey || !toKey) {
      debugError(`无法找到城市映射: ${fromCity} -> ${fromKey}, ${toCity} -> ${toKey}`)
      return 0
    }
    
    const routeKey1 = `${fromKey}${toKey.charAt(0).toUpperCase() + toKey.slice(1)}`
    const routeKey2 = `${toKey}${fromKey.charAt(0).toUpperCase() + fromKey.slice(1)}`
    
    if (routeKey1 in costs) {
      const cost = costs[routeKey1 as keyof typeof costs]
      if (typeof cost === 'number' && cost > 0) {
        debugLog(`找到路由 ${routeKey1}: ${cost}元 (${fromCity} -> ${toCity}, ${type})`)
        return cost
      }
    }
    if (routeKey2 in costs) {
      const cost = costs[routeKey2 as keyof typeof costs]
      if (typeof cost === 'number' && cost > 0) {
        debugLog(`找到路由 ${routeKey2}: ${cost}元 (${fromCity} -> ${toCity}, ${type})`)
        return cost
      }
    }
    
    debugError(`无法找到路由配置: ${routeKey1} 或 ${routeKey2}`, '可用路由:', Object.keys(costs), 'fromCity:', fromCity, 'toCity:', toCity, 'type:', type)
    return 0
  }

  const showBuildings = (addMessage: (msg: ChatMessage, stream?: boolean) => void) => {
    const { buildings: buildingConfig } = getCurrentCityTheme()
    const buildings = [
      { 
        name: buildingConfig.bank.name, 
        icon: buildingConfig.bank.icon, 
        description: '存款取款服务', 
        action: 'bank' 
      },
      { 
        name: buildingConfig.hospital.name, 
        icon: buildingConfig.hospital.icon, 
        description: '治疗健康', 
        action: 'hospital' 
      },
      { 
        name: buildingConfig.delivery.name, 
        icon: buildingConfig.delivery.icon, 
        description: `${buildingConfig.delivery.description} (${gameConfig.buildings.delivery.cost}元)`, 
        action: 'delivery', 
        disabled: gameState.value.cash < gameConfig.buildings.delivery.cost 
      },
      { 
        name: buildingConfig.constructionSite.name, 
        icon: buildingConfig.constructionSite.icon, 
        description: buildingConfig.constructionSite.description, 
        action: 'construction-site'
      },
      { 
        name: buildingConfig.postOffice.name, 
        icon: buildingConfig.postOffice.icon, 
        description: buildingConfig.postOffice.description, 
        action: 'post-office' 
      },
      { 
        name: buildingConfig.house.name, 
        icon: buildingConfig.house.icon, 
        description: `${buildingConfig.house.description} (${gameState.value.cash >= gameConfig.buildings.house.discountThreshold ? '半价' : '全价'})`, 
        action: 'house-expand', 
        disabled: gameState.value.cash < gameConfig.buildings.house.expansionCost / 2 
      },
      { 
        name: '出行', 
        icon: '✈️/🚄', 
        description: '选择交通工具前往其它城市', 
        action: 'travel-select' 
      }
    ]

    addMessage({
      type: 'system',
      content: '🏢 选择你想去的地方或者服务：',
      icon: '🏢',
      options: buildings.map(building => ({
        label: `${building.icon} ${building.name} - ${building.description}`,
        action: building.action,
        disabled: building.disabled
      }))
    }, true)
  }

  const showTransportationMenu = (addMessage: (msg: ChatMessage, stream?: boolean) => void, type: 'train' | 'plane') => {
    const currentCity = gameState.value.currentCity
    const uniqueVisits = new Set(gameState.value.cityVisitsThisWeek)
    const canVisitMore = uniqueVisits.size < 2
    
    const transportName = type === 'train' ? '高铁' : '飞机'
    const transportIcon = type === 'train' ? '🚄' : '✈️'
    
    const cities = availableCities
      .filter(city => city.name !== currentCity)
      .map(city => {
        const cost = getTransportationCost(currentCity, city.name, type)
        const isDisabled = city.name === currentCity || (!canVisitMore && !uniqueVisits.has(city.name))
        return {
          label: `${city.name} (${cost.toLocaleString()}元)${isDisabled ? ' (不可用)' : ''}`,
          action: 'travel',
          data: { cityName: city.name, type },
          disabled: isDisabled || gameState.value.cash < cost
        }
      })

    addMessage({
      type: 'system',
      content: `${transportIcon} 选择要前往的城市（${transportName}）：\n当前城市：${currentCity}\n本周已访问：${uniqueVisits.size}/2`,
      icon: transportIcon,
      options: cities
    }, true)
  }

  const showStatus = (addMessage: (msg: ChatMessage, stream?: boolean) => void, finalScore: number) => {
    const timeUnit = gameConfig?.time?.unit || '周'
    const status = `📊 当前状态：

⏰ ${gameState.value.timeLeft}${timeUnit} | 💰 ${gameState.value.cash.toLocaleString()} | 🏦 ${gameState.value.bankSavings.toLocaleString()} | 💸 ${gameState.value.debt.toLocaleString()}
📦 ${gameState.value.totalGoods}/${gameState.value.maxCapacity}

${finalScore > 0 ? `💯 得分: ${finalScore.toLocaleString()}` : ''}`

    addMessage({
      type: 'system',
      content: status,
      icon: '📊'
    }, true)
  }

  return {
    ownedGoods,
    showMarket,
    showInventory,
    showBuildings,
    showStatus,
    showTransportationMenu,
    getTransportationCost
  }
}

