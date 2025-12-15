import type { GameState } from '@/types/game'
import type { IMessageHandler } from '../interfaces/IMessageHandler'
import { BaseManager } from '../base/BaseManager'
import { City } from '../models/City'
import { Player } from '../models/Player'
import { availableCities, shanghaiTheme } from '@/config/theme.config'
import type { ThemeConfig } from '@/config/theme.config'
import type { GameConfig } from '@/config/game.config'
import { debugLog, debugError } from '../../utils/debug'

export type TransportationType = 'train' | 'plane'

export class CityManager extends BaseManager {
  private cities: Map<string, City> = new Map()
  private player: Player

  constructor(
    state: GameState,
    config: GameConfig,
    messageHandler: IMessageHandler,
    private onCityChange?: (city: string, theme: ThemeConfig) => void
  ) {
    super(state, config, messageHandler)
    this.player = new Player(state)
    this.initializeCities()
  }

  private initializeCities(): void {
    availableCities.forEach(cityInfo => {
      const city = new City(
        cityInfo.name,
        cityInfo.shortName,
        cityInfo.theme,
        [...this.state.cityVisitsThisWeek]
      )
      this.cities.set(cityInfo.name, city)
    })
  }

  getCity(cityName: string): City | undefined {
    return this.cities.get(cityName)
  }

  getCurrentCity(): City | undefined {
    return this.getCity(this.player.currentCity)
  }

  getAllCities(): City[] {
    return Array.from(this.cities.values())
  }

  /**
   * 获取城市配置键（用于交通费用配置）
   * 从城市名称映射到配置键（如 "北京" -> "beijing"）
   */
  private getCityConfigKey(cityName: string): string {
    // 城市名称到配置键的映射
    const cityNameMap: Record<string, string> = {
      '北京': 'beijing',
      '上海': 'shanghai',
      '广州': 'guangzhou',
      '深圳': 'shenzhen',
      '杭州': 'hangzhou'
    }
    
    // 如果城市名称在映射中，直接返回
    const mapped = cityNameMap[cityName]
    if (mapped) {
      return mapped
    }
    
    // 尝试通过城市对象获取
    const city = this.getCity(cityName)
    if (city) {
      // 城市简称到配置键的映射
      const shortNameMap: Record<string, string> = {
        '京': 'beijing',
        '沪': 'shanghai',
        '粤': 'guangzhou',
        '深': 'shenzhen',
        '杭': 'hangzhou'
      }
      
      // 如果简称在映射中，使用简称映射
      const byShort = shortNameMap[city.shortName]
      if (byShort) {
        return byShort
      }

      const byName = cityNameMap[city.name]
      if (byName) {
        return byName
      }
    }
    
    // 最后的后备方案：转换为小写
    return cityName.toLowerCase()
  }

  getTransportationCost(fromCity: string, toCity: string, type: TransportationType): number {
    if (!this.config.transportation || !this.config.transportation[type]) {
      debugError(`交通配置不存在: transportation.${type}`)
      return 0
    }
    
    const costs = this.config.transportation[type]
    
    const fromKey = this.getCityConfigKey(fromCity)
    const toKey = this.getCityConfigKey(toCity)
    
    // 生成配置键：fromTo（如 beijingShanghai）
    const routeKey1 = `${fromKey}${toKey.charAt(0).toUpperCase() + toKey.slice(1)}`
    const routeKey2 = `${toKey}${fromKey.charAt(0).toUpperCase() + fromKey.slice(1)}`
    
    // 尝试两种可能的键格式（双向）
    for (const key of [routeKey1, routeKey2]) {
      if (key in costs) {
        const cost = costs[key as keyof typeof costs]
        if (typeof cost === 'number' && cost > 0) {
          return cost
        }
      }
    }
    
    debugError(`无法找到路由配置: ${routeKey1} 或 ${routeKey2}`, '可用路由:', Object.keys(costs), 'fromCity:', fromCity, 'toCity:', toCity)
    return 0
  }

  canSwitchCity(cityName: string): boolean {
    const targetCity = this.getCity(cityName)
    if (!targetCity) {
      this.showMessage(`找不到城市：${cityName}`)
      return false
    }

    if (this.player.currentCity === cityName) {
      this.showMessage(`你已经在${cityName}了！`)
      return false
    }

    if (!targetCity.canVisit(2)) {
      this.showMessage("本周已经去过2个城市了，下周才能再去新城市！")
      return false
    }

    return true
  }

  switchCity(cityName: string, transportationType: TransportationType = 'train'): boolean {
    const targetCity = this.getCity(cityName)
    if (!targetCity || !this.canSwitchCity(cityName)) {
      return false
    }

    const cost = this.getTransportationCost(this.player.currentCity, cityName, transportationType)
    
    if (cost <= 0) {
      debugError(`交通费用计算错误: ${cost}元 (${this.player.currentCity} -> ${cityName}, ${transportationType})`)
      this.showMessage(`交通费用计算错误，无法前往${cityName}`)
      return false
    }
    
    if (!this.player.canAfford(cost)) {
      this.showMessage(`现金不足！需要${cost.toLocaleString()}元才能前往${cityName}`)
      return false
    }

    const previousCity = this.player.currentCity
    const previousCash = this.player.cash
    
    this.player.subtractCash(cost)
    this.player.setCurrentCity(cityName)
    targetCity.addVisit()
    
    if (!this.state.cityVisitsThisWeek.includes(cityName)) {
      this.state.cityVisitsThisWeek.push(cityName)
    }

    const transportName = transportationType === 'train' ? '高铁' : '飞机'
    debugLog(`城市切换: ${previousCity} -> ${cityName}, 费用: ${cost}元, 现金: ${previousCash} -> ${this.player.cash}`)
    this.showMessage(`成功乘坐${transportName}前往${cityName}！花费${cost.toLocaleString()}元，剩余现金${this.player.cash.toLocaleString()}元`)
    
    if (this.onCityChange) {
      this.onCityChange(cityName, targetCity.theme)
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

  getCurrentCityTheme(): ThemeConfig {
    const currentCity = this.getCurrentCity()
    return currentCity?.theme || availableCities[0]?.theme || shanghaiTheme
  }
}

