import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { gameConfig } from '@/config/game.config'
import { getAvailableCities, getCity, configManager, getCityKeyByName } from '@/config/theme.config'
import type { ChatMessage } from './useGameChat'
import { debugLog, debugError } from '@/utils/debug'

import type { GoodsDefinition, LocationDefinition } from '@/types/game'
import type { BuildingConfig } from '@/config/ConfigManager'

interface CityTheme {
  game: {
    title: string
    logo: string
    logoColor: string
    description: string
  }
  city: {
    name: string
    shortName: string
    locations: LocationDefinition[]
  }
  goods: GoodsDefinition[]
  buildings: BuildingConfig
  transportation: {
    subwayFare: number
  }
}

export function useGameActions() {
  const gameStore = useGameStore()
  const gameState = computed(() => gameStore.gameState)

  // 获取当前城市的配置
  const getCurrentCityTheme = (): CityTheme => {
    const cityKey = getCityKeyByName(gameState.value.currentCity || '上海')
    const currentCity = getCity(cityKey) || getCity('shanghai')
    if (currentCity) {
      return {
        game: {
          title: `${currentCity.getCityName()}创业记`,
          logo: currentCity.getShortName(),
          logoColor: 'from-blue-500 to-cyan-500',
          description: `${currentCity.getCityName()}创业记`
        },
        city: {
          name: currentCity.getCityName(),
          shortName: currentCity.getShortName(),
          locations: currentCity.getLocations()
        },
        goods: currentCity.getGoods(),
        buildings: currentCity.getBuildings(),
        transportation: {
          subwayFare: configManager.getSubwayFare(cityKey)
        }
      }
    }
    // 默认返回上海
    const shanghaiCity = getCity('shanghai')
    return shanghaiCity ? {
      game: {
        title: `${shanghaiCity.getCityName()}创业记`,
        logo: shanghaiCity.getShortName(),
        logoColor: 'from-blue-500 to-cyan-500',
        description: '魔都创业记'
      },
      city: {
        name: shanghaiCity.getCityName(),
        shortName: shanghaiCity.getShortName(),
        locations: shanghaiCity.getLocations()
      },
      goods: shanghaiCity.getGoods(),
      buildings: shanghaiCity.getBuildings(),
      transportation: {
        subwayFare: configManager.getSubwayFare('shanghai')
      }
    } : {
      game: {
        title: '上海创业记',
        logo: '沪',
        logoColor: 'from-blue-500 to-cyan-500',
        description: '魔都创业记'
      },
      city: {
        name: '上海',
        shortName: '沪',
        locations: []
      },
      goods: [],
      buildings: {
        bank: { name: '银行', icon: '🏦' },
        hospital: { name: '医院', icon: '🏥' },
        constructionSite: { name: '打工', icon: '💼', workTypes: [] },
        postOffice: { name: '邮局', icon: '📬' },
        house: { name: '中介', icon: '🏠' }
      },
      transportation: {
        subwayFare: 3
      }
    }
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
    
    // 如果提供了 addMessage，则显示商品黑市消息（不带购买选项）
    if (addMessage) {
      const theme = getCurrentCityTheme()
      const marketManager = gameStore.marketManager
      const cityGoodsIds = new Set(theme.goods.map(g => g.id))
      const marketInfo = marketManager.getMarketInfo(theme.city.name, cityGoodsIds)

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
    // 使用配置管理器计算交通费用
    const fromKey = getCityKeyByName(fromCity)
    const toKey = getCityKeyByName(toCity)
    const cost = configManager.getTransportationCost(fromKey, toKey, type)
    if (cost && cost > 0) {
      debugLog(`交通费用: ${cost}元 (${fromCity} -> ${toCity}, ${type})`)
      return cost
    }

    debugError('无法找到路由配置', { type, fromCity, toCity })
    return 0
  }

  const showBuildings = (addMessage: (msg: ChatMessage, stream?: boolean) => void) => {
    const { buildings: buildingConfig } = getCurrentCityTheme()
    const currentTheme = getCurrentCityTheme()
    const subwayFare = currentTheme.transportation?.subwayFare ?? 0

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
        name: buildingConfig.constructionSite.name || '打工',
        icon: buildingConfig.constructionSite.icon || '💼',
        description: buildingConfig.constructionSite.description || '选择工作类型赚取收入（建筑工地、送外卖、仓库搬运、餐厅服务员、清洁工）',
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
        description: buildingConfig.house.description || '通过中介租房，提升仓库容量',
        action: 'house-menu'
      },
      {
        name: gameConfig.buildings.restaurant?.name || '饭店',
        icon: gameConfig.buildings.restaurant?.icon || '🍜',
        description: (() => {
          const cfg = gameConfig.buildings.restaurant
          if (!cfg) return '吃饭恢复体力'
          return '吃饭恢复体力'
        })(),
        action: 'restaurant',
        disabled: gameState.value.cash < (gameConfig.buildings.restaurant?.costRange?.[0] ?? 20)
      },
      {
        name: '出行（地铁）',
        icon: buildingConfig.subway?.icon || '🚇',
        description: buildingConfig.subway?.description || '乘坐地铁出行',
        action: 'subway-travel'
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

  const showTransportationMenu = (type: 'train' | 'plane') => {
    const currentCity = gameState.value.currentCity
    const uniqueVisits = new Set(gameState.value.cityVisitsThisWeek)
    const canVisitMore = uniqueVisits.size < 2
    
    const transportName = type === 'train' ? '高铁' : '飞机'
    const transportIcon = type === 'train' ? '🚄' : '✈️'
    
    const allCities = getAvailableCities()
    const cities = allCities
      .filter(city => city.name !== currentCity)
      .map(city => {
        const rawCost = getTransportationCost(currentCity, city.name, type)
        const cost = typeof rawCost === 'number' && rawCost > 0 ? rawCost : 0
        const isDisabled =
          city.name === currentCity ||
          (!canVisitMore && !uniqueVisits.has(city.name)) ||
          cost <= 0
        return {
          cityName: city.name,
          cost,
          type,
          disabled: isDisabled || gameState.value.cash < cost
        }
      })
    
    return {
      currentCity,
      transportName,
      transportIcon,
      uniqueVisitsCount: uniqueVisits.size,
      options: cities
    }
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
    getCurrentCityTheme,
    showMarket,
    showInventory,
    showBuildings,
    showStatus,
    showTransportationMenu,
    getTransportationCost
  }
}

