import type { GoodsDefinition, RandomEvent, HealthEvent, MoneyEvent, LocationDefinition } from '@/types/game'
import type { GameConfig, PriceStrategy, EventStrategy, TransportationStrategy, RentStrategy, BuildingConfig } from './game.config'
import { GOODS_ID_BASE, PRICE_WEEK_MULTIPLIER_BASE, PRICE_WEEK_MULTIPLIER_MIN, PRICE_WEEK_MULTIPLIER_MAX, DEFAULT_SUBWAY_FARE, RENT_EXPANSION_COST, RENT_DISCOUNT_THRESHOLD, RENT_CAPACITY_MULTIPLIER, DEFAULT_CAPACITY, type Season } from './constants'

// 重新导出基础策略类，方便其他文件使用
export type { PriceStrategy, EventStrategy, TransportationStrategy, RentStrategy, BuildingConfig } from './game.config'
import { gameConfig } from './game.config'

/**
 * 商品信息接口
 */
export interface GoodsInfo {
  /** 商品定义数据（不包含运行时状态） */
  goods: GoodsDefinition
  /** 商品所属的城市配置 */
  cityConfig: CityConfig
}

/**
 * 租金信息接口
 */
export interface RentInfo {
  /** 基础租金 */
  baseRent: number
  /** 扩展成本 */
  expansionCost: number
  /** 折扣阈值 */
  discountThreshold: number
}

/**
 * 酒店信息接口
 */
export interface HotelInfo {
  /** 每日酒店价格 */
  dailyPrice: number
  /** 每周酒店价格（每日价格 * 7） */
  weeklyPrice: number
}

// 事件创建工具函数
export class EventFactory {
  /**
   * 创建商业事件
   */
  static createCommercialEvent(
    freq: number,
    message: string,
    goodsId: number,
    priceMultiplier: number,
    priceDivider: number = 0,
    tags?: string[]
  ): RandomEvent {
    return {
      freq,
      message,
      goodsId,
      priceMultiplier,
      priceDivider,
      goodsGiven: 0,
      tags
    }
  }

  /**
   * 创建健康事件
   */
  static createHealthEvent(
    freq: number,
    message: string,
    damage: number,
    sound: string = '',
    tags?: string[]
  ): HealthEvent {
    return {
      freq,
      message,
      damage,
      sound,
      tags
    }
  }

  /**
   * 创建金钱事件
   */
  static createMoneyEvent(
    freq: number,
    message: string,
    cashMultiplier: number
  ): MoneyEvent {
    return {
      freq,
      message,
      cashMultiplier
    }
  }
}

// 城市配置抽象基类
export abstract class CityConfig {
  protected readonly cityId: number
  protected readonly cityName: string
  protected readonly shortName: string
  protected readonly description: string
  protected readonly features: string[]

  constructor(cityId: number, cityName: string, shortName: string, description: string, features: string[]) {
    this.cityId = cityId
    this.cityName = cityName
    this.shortName = shortName
    this.description = description
    this.features = features
  }

  // 获取城市基本信息
  getCityId(): number { return this.cityId }
  getCityName(): string { return this.cityName }
  getShortName(): string { return this.shortName }
  getDescription(): string { return this.description }
  getFeatures(): string[] { return this.features }

  // 抽象方法 - 子类必须实现
  abstract getLocations(): LocationDefinition[]
  abstract getGoods(): GoodsDefinition[]
  abstract getBuildings(): BuildingConfig
  abstract getPriceStrategy(): PriceStrategy
  abstract getEventStrategy(): EventStrategy
  abstract getTransportationStrategy(): TransportationStrategy
  abstract getRentStrategy(): RentStrategy

  // 模板方法 - 生成商品ID
  generateGoodsId(goodsIndex: number): number {
    return this.cityId * GOODS_ID_BASE + goodsIndex
  }

  // 模板方法 - 解析商品ID
  static parseGoodsId(goodsId: number): { cityId: number; goodsIndex: number } {
    return {
      cityId: Math.floor(goodsId / GOODS_ID_BASE),
      goodsIndex: goodsId % GOODS_ID_BASE
    }
  }
}

// 基础策略实现类
export class BasePriceStrategy implements PriceStrategy {
  calculatePrice(basePrice: number, priceRange: number, currentWeek?: number): number {
    const week = currentWeek || 1
    const base = basePrice + Math.random() * priceRange
    const weekMultiplier = Math.max(PRICE_WEEK_MULTIPLIER_MIN, Math.min(PRICE_WEEK_MULTIPLIER_MAX, 1 + (week - 25) * PRICE_WEEK_MULTIPLIER_BASE))
    return Math.round(base * weekMultiplier)
  }

  getPriceMultiplier(event: RandomEvent): number {
    // 基础实现：根据事件类型返回价格倍数
    if (event.priceMultiplier && event.priceMultiplier > 0) {
      return event.priceMultiplier
    }
    if (event.priceDivider && event.priceDivider > 0) {
      return 1 / event.priceDivider
    }
    return 1
  }
}

export class BaseEventStrategy implements EventStrategy {
  protected commercialEvents: RandomEvent[] = []
  protected healthEvents: HealthEvent[] = []
  protected moneyEvents: MoneyEvent[] = []

  constructor(
    commercialEvents: RandomEvent[] = [],
    healthEvents: HealthEvent[] = [],
    moneyEvents: MoneyEvent[] = []
  ) {
    this.commercialEvents = commercialEvents
    this.healthEvents = healthEvents
    this.moneyEvents = moneyEvents
  }

  getCommercialEvents(): RandomEvent[] {
    return this.commercialEvents
  }

  getHealthEvents(): HealthEvent[] {
    return this.healthEvents
  }

  getMoneyEvents(): MoneyEvent[] {
    return this.moneyEvents
  }

  filterEventsBySeason(events: RandomEvent[], currentSeason?: Season): RandomEvent[] {
    if (!currentSeason) return events
    return events.filter(event => {
      const eventTags = event.tags || []
      return eventTags.includes(currentSeason)
    })
  }
}

export class BaseTransportationStrategy implements TransportationStrategy {
  protected trainFares: Record<string, number> = {}
  protected planeFares: Record<string, number> = {}
  protected subwayFare: number = DEFAULT_SUBWAY_FARE

  constructor(trainFares: Record<string, number> = {}, planeFares: Record<string, number> = {}, subwayFare: number = DEFAULT_SUBWAY_FARE) {
    this.trainFares = trainFares
    this.planeFares = planeFares
    this.subwayFare = subwayFare
  }

  getTrainFare(toCityKey: string): number | undefined {
    return this.trainFares[toCityKey]
  }

  getPlaneFare(toCityKey: string): number | undefined {
    return this.planeFares[toCityKey]
  }

  getSubwayFare(): number {
    return this.subwayFare
  }
}

export class BaseRentStrategy implements RentStrategy {
  protected baseRent: number
  protected expansionCost: number
  protected discountThreshold: number
  protected hotelDailyPrice: number

  constructor(
    baseRent: number,
    hotelDailyPrice: number = 300,
    expansionCost: number = RENT_EXPANSION_COST,
    discountThreshold: number = RENT_DISCOUNT_THRESHOLD
  ) {
    this.baseRent = baseRent
    this.hotelDailyPrice = hotelDailyPrice
    this.expansionCost = expansionCost
    this.discountThreshold = discountThreshold
  }

  getBaseRent(): number {
    return this.baseRent
  }

  getExpansionCost(): number {
    return this.expansionCost
  }

  getDiscountThreshold(): number {
    return this.discountThreshold
  }

  getHotelDailyPrice(): number {
    return this.hotelDailyPrice
  }

  calculateRentWithCapacity(capacity: number): number {
    const baseRent = this.getBaseRent()
    const additionalCapacity = Math.max(0, capacity - DEFAULT_CAPACITY) // 超过基础容量的部分
    const additionalRent = additionalCapacity * (baseRent * RENT_CAPACITY_MULTIPLIER) // 每增加1容量，多收相应比例的租金
    return Math.round(baseRent + additionalRent)
  }
}

// 配置管理器 - 单例模式
export class ConfigManager {
  private static instance: ConfigManager
  private cities: Map<string, CityConfig> = new Map()
  private currentCity: CityConfig | null = null

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  // 注册城市配置
  registerCity(cityKey: string, cityConfig: CityConfig): void {
    this.cities.set(cityKey, cityConfig)
  }

  // 获取城市配置
  getCityConfig(cityKey: string): CityConfig | undefined {
    return this.cities.get(cityKey)
  }

  // 获取所有城市配置
  getAllCityConfigs(): Map<string, CityConfig> {
    return new Map(this.cities)
  }

  // 设置当前城市
  setCurrentCity(cityKey: string): boolean {
    const cityConfig = this.getCityConfig(cityKey)
    if (cityConfig) {
      this.currentCity = cityConfig
      return true
    }
    return false
  }

  // 获取当前城市配置
  getCurrentCityConfig(): CityConfig | null {
    return this.currentCity
  }

  // 获取全局游戏配置
  getGameConfig(): GameConfig {
    return gameConfig
  }

  // 获取城市列表（用于UI显示）
  getCityList(): Array<{ key: string; name: string; shortName: string }> {
    const cities: Array<{ key: string; name: string; shortName: string }> = []
    this.cities.forEach((config, key) => {
      cities.push({
        key,
        name: config.getCityName() || '未知城市',
        shortName: config.getShortName() || '未知'
      })
    })
    return cities
  }

  // 根据商品ID获取商品信息
  getGoodsInfo(goodsId: number): GoodsInfo | null {
    try {
      const { cityId, goodsIndex } = CityConfig.parseGoodsId(goodsId)

      // 验证商品ID的有效性
      if (cityId < 0 || goodsIndex < 0) {
        console.warn(`Invalid goodsId: ${goodsId}`)
        return null
      }

      for (const cityConfig of Array.from(this.cities.values())) {
        if (cityConfig.getCityId() === cityId) {
          const goods = cityConfig.getGoods()
          if (goodsIndex >= 0 && goodsIndex < goods.length) {
            const goodsItem = goods[goodsIndex]
            if (goodsItem) {
              return { goods: goodsItem, cityConfig }
            }
          }
          break // 找到了城市但商品不存在，直接返回null
        }
      }

      console.warn(`Goods not found for goodsId: ${goodsId}`)
      return null
    } catch (error) {
      console.error(`Error parsing goodsId ${goodsId}:`, error)
      return null
    }
  }

  // 计算商品价格（结合策略模式）
  calculateGoodsPrice(goodsId: number, currentWeek: number = 1): number {
    try {
      const goodsInfo = this.getGoodsInfo(goodsId)
      if (!goodsInfo) {
        console.warn(`Cannot calculate price for invalid goodsId: ${goodsId}`)
        return 0
      }

      const { goods, cityConfig } = goodsInfo
      const priceStrategy = cityConfig.getPriceStrategy()

      // 确保参数有效
      const validWeek = Math.max(1, Math.floor(currentWeek))
      const basePrice = Math.max(0, goods.basePrice)
      const priceRange = Math.max(0, goods.priceRange)

      const price = priceStrategy.calculatePrice(basePrice, priceRange, validWeek)
      return Math.max(0, Math.floor(price)) // 确保返回非负整数
    } catch (error) {
      console.error(`Error calculating price for goodsId ${goodsId}:`, error)
      return 0
    }
  }

  // 获取城市间交通费用
  getTransportationCost(fromCityKey: string, toCityKey: string, type: 'train' | 'plane'): number | undefined {
    try {
      // 验证参数
      if (!fromCityKey || !toCityKey || !['train', 'plane'].includes(type)) {
        console.warn(`Invalid transportation parameters: from=${fromCityKey}, to=${toCityKey}, type=${type}`)
        return undefined
      }

      const fromCity = this.getCityConfig(fromCityKey)
      if (!fromCity) {
        console.warn(`Source city not found: ${fromCityKey}`)
        return undefined
      }

      const transportationStrategy = fromCity.getTransportationStrategy()
      const cost = type === 'train'
        ? transportationStrategy.getTrainFare(toCityKey)
        : transportationStrategy.getPlaneFare(toCityKey)

      return cost !== undefined ? Math.max(0, Math.floor(cost)) : undefined
    } catch (error) {
      console.error(`Error getting transportation cost from ${fromCityKey} to ${toCityKey}:`, error)
      return undefined
    }
  }

  // 获取地铁费用
  getSubwayFare(cityKey: string): number {
    try {
      if (!cityKey) {
        console.warn('Invalid city key for subway fare')
        return DEFAULT_SUBWAY_FARE
      }

      const city = this.getCityConfig(cityKey)
      if (!city) {
        console.warn(`City not found for subway fare: ${cityKey}`)
        return DEFAULT_SUBWAY_FARE
      }

      const fare = city.getTransportationStrategy().getSubwayFare()
      return Math.max(0, Math.floor(fare))
    } catch (error) {
      console.error(`Error getting subway fare for city ${cityKey}:`, error)
      return DEFAULT_SUBWAY_FARE
    }
  }

  // 获取城市租金信息
  getRentInfo(cityKey: string): RentInfo | null {
    try {
      if (!cityKey) {
        console.warn('Invalid city key for rent info')
        return null
      }

      const city = this.getCityConfig(cityKey)
      if (!city) {
        console.warn(`City not found for rent info: ${cityKey}`)
        return null
      }

      const rentStrategy = city.getRentStrategy()
      return {
        baseRent: Math.max(0, Math.floor(rentStrategy.getBaseRent())),
        expansionCost: Math.max(0, Math.floor(rentStrategy.getExpansionCost())),
        discountThreshold: Math.max(0, Math.floor(rentStrategy.getDiscountThreshold()))
      }
    } catch (error) {
      console.error(`Error getting rent info for city ${cityKey}:`, error)
      return null
    }
  }

  // 获取随机事件（结合季节过滤）
  getRandomEvents(cityKey: string, type: 'commercial' | 'health' | 'money', currentSeason?: Season): RandomEvent[] | HealthEvent[] | MoneyEvent[] {
    const city = this.getCityConfig(cityKey)
    if (!city) return []

    const eventStrategy = city.getEventStrategy()
    let events: RandomEvent[] | HealthEvent[] | MoneyEvent[]

    switch (type) {
      case 'commercial':
        events = eventStrategy.getCommercialEvents()
        break
      case 'health':
        events = eventStrategy.getHealthEvents()
        break
      case 'money':
        events = eventStrategy.getMoneyEvents()
        break
      default:
        return []
    }

    // 如果是商业事件，支持季节过滤
    if (type === 'commercial') {
      return eventStrategy.filterEventsBySeason(events as RandomEvent[], currentSeason)
    }

    return events
  }

  // 获取建筑配置
  getBuildingConfig(cityKey: string) {
    const city = this.getCityConfig(cityKey)
    return city?.getBuildings()
  }

  // 获取地点列表
  getLocations(cityKey: string): LocationDefinition[] {
    const city = this.getCityConfig(cityKey)
    return city?.getLocations() ?? []
  }

  // 获取商品列表
  getGoodsList(cityKey: string): GoodsDefinition[] {
    const city = this.getCityConfig(cityKey)
    return city?.getGoods() ?? []
  }
}
