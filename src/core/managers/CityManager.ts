import type { GameState } from '@/types/game'
import type { IMessageHandler } from '../interfaces/IMessageHandler'
import { BaseManager } from '../base/BaseManager'
import { City } from '../models/City'
import { Player } from '../models/Player'
import { configManager, getCity, getCityKeyByName } from '@/config/theme.config'
import type { GameConfig } from '@/config/game.config'
import { debugLog, debugError } from '../../utils/debug'
import type { LocationDefinition, GoodsDefinition } from '@/types/game'
import type { BuildingConfig } from '@/config/ConfigManager'

interface CityThemeForCallback {
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
}

export type TransportationType = 'train' | 'plane'

export class CityManager extends BaseManager {
  private cities: Map<string, City> = new Map()
  private player: Player

  constructor(
    state: GameState,
    config: GameConfig,
    messageHandler: IMessageHandler,
    private onCityChange?: (city: string, theme: CityThemeForCallback) => void
  ) {
    super(state, config, messageHandler)
    this.player = new Player(state)
    this.initializeCities()
  }

  private initializeCities(): void {
    const cityList = configManager.getCityList()
    cityList.forEach(cityInfo => {
      const cityConfig = configManager.getCityConfig(cityInfo.key)
      if (cityConfig) {
        const city = new City(
          cityConfig.getCityName(),
          cityConfig.getShortName()
        )
        this.cities.set(cityInfo.key, city)
      }
    })
  }

  getCity(cityName: string): City | undefined {
    return this.cities.get(cityName)
  }

  getCurrentCity(): City | undefined {
    return this.getCity(this.player.currentCity)
  }

  private getCityConfigKey(cityName: string): string {
    const city = this.getCity(cityName)
    if (city) {
      // 城市简称到配置键的映射
      const cityKeyMap: Record<string, string> = {
        '京': 'beijing',
        '沪': 'shanghai',
        '杭': 'hangzhou',
        '苏': 'suzhou',
        '深': 'shenzhen',
        '津': 'tianjin',
        '青': 'qingdao',
        '穗': 'guangzhou'
      }
      const key = cityKeyMap[city.shortName]
      if (key) {
        return key
      }
    }
    
    // 最后的后备方案：转换为小写
    return cityName.toLowerCase()
  }

  getTransportationCost(fromCity: string, toCity: string, type: TransportationType): number {
    const fromKey = getCityKeyByName(fromCity)
    const toKey = getCityKeyByName(toCity)
    const cost = configManager.getTransportationCost(fromKey, toKey, type)
    if (cost && cost > 0) {
      return cost
    }
    debugError('无法找到路由配置', { type, fromCity, toCity })
    return 0
  }

  canSwitchCity(cityName: string): boolean {
    const cityKey = getCityKeyByName(cityName)
    const targetCity = this.getCity(cityKey)
    if (!targetCity) {
      this.showMessage(`找不到城市：${cityName}`)
      return false
    }

    const maxVisits = 3 // 默认每周最多访问3次
    if (!targetCity.canVisit(maxVisits)) {
      this.showMessage(`本周已经访问过${cityName}太多次了，下周再来吧！`)
      return false
    }

    return true
  }

  switchCity(
    cityName: string,
    type: TransportationType = 'train',
    options?: { skipCost?: boolean }
  ): boolean {
    const cityKey = getCityKeyByName(cityName)
    const targetCity = this.getCity(cityKey)
    if (!targetCity || !this.canSwitchCity(cityName)) {
      return false
    }

    const currentCityName = this.player.currentCity
    if (currentCityName === cityName) {
      this.showMessage(`你已经在${cityName}了！`)
      return false
    }

    if (!options?.skipCost) {
      const cost = this.getTransportationCost(currentCityName, cityName, type)
      if (!cost || cost <= 0) {
        this.showMessage(`无法找到从${currentCityName}到${cityName}的${type === 'train' ? '高铁' : '航班'}路线`)
        return false
      }

      if (this.player.cash < cost) {
        this.showMessage(`现金不足，无法支付${cost.toLocaleString()}元的${type === 'train' ? '高铁' : '航班'}费用`)
        return false
      }

      // 扣除交通费用
      this.player.subtractCash(cost)
      debugLog(`扣除交通费用: ${cost}元，剩余现金: ${this.player.cash}元`)
    }

    // 更新当前城市
    this.player.setCurrentCity(cityName)
    targetCity.addVisit()

    // 更新位置（移动到新城市的第一个位置）
    const locations = targetCity.getLocations()
    if (locations && locations.length > 0 && locations[0]) {
      this.player.setCurrentLocation(locations[0].id)
    }


    // 这里不再通过 Manager 层显示成功提示，统一交给前端 useGameLogic 的 handleCitySwitch
    
    if (this.onCityChange) {
      const cityConfigForTheme = configManager.getCityConfig(cityName.toLowerCase())
      if (cityConfigForTheme) {
        this.onCityChange(cityName, {
          game: {
            title: `${cityConfigForTheme.getCityName()}创业记`,
            logo: cityConfigForTheme.getShortName(),
            logoColor: 'from-blue-500 to-cyan-500',
            description: `${cityConfigForTheme.getCityName()}创业记`
          },
          city: {
            name: cityConfigForTheme.getCityName(),
            shortName: cityConfigForTheme.getShortName(),
            locations: cityConfigForTheme.getLocations()
          },
          goods: cityConfigForTheme.getGoods(),
          buildings: cityConfigForTheme.getBuildings()
        })
      }
    }

    return true
  }

  resetWeeklyVisits(): void {
    this.state.cityVisitsThisWeek = []
    this.cities.forEach(city => city.resetVisits())
  }

  getAvailableCities(): string[] {
    return Array.from(this.cities.keys())
  }

  getCurrentCityTheme(): CityThemeForCallback | null {
    const cityKey = getCityKeyByName(this.player.currentCity || '上海')
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
        buildings: currentCity.getBuildings()
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
      buildings: shanghaiCity.getBuildings()
    } : null
  }
}
