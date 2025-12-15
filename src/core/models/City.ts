import { configManager } from '@/config/theme.config'
import type { GoodsDefinition, RandomEvent, HealthEvent, MoneyEvent } from '@/types/game'
import type { CityConfig, BuildingConfig } from '@/config/ConfigManager'
import { Location, LocationType } from './Location'

/**
 * 城市事件集合接口
 */
interface CityEvents {
  /** 商业事件列表 */
  commercial: RandomEvent[]
  /** 健康事件列表 */
  health: HealthEvent[]
  /** 金钱事件列表 */
  money: MoneyEvent[]
}

export class City {
  private locations: Location[] = []
  private cityConfig: CityConfig | null = null

  constructor(
    public readonly name: string,
    public readonly shortName: string,
    private visitsThisWeek: string[] = []
  ) {
    // 通过配置中的城市列表，根据中文名或简称找到对应的配置键
    const cityList = configManager.getCityList()
    const matched = cityList.find(
      c => c.name === name || c.shortName === shortName
    )
    const cityKey = matched?.key ?? name.toLowerCase()
    this.cityConfig = configManager.getCityConfig(cityKey) || null
    this.initializeLocations()
  }

  private initializeLocations(): void {
    if (!this.cityConfig) {
      console.error(`City config not found for: ${this.name}`)
      return
    }

    const locationDefinitions = this.cityConfig.getLocations()
    this.locations = locationDefinitions.map(definition => {
      let type = LocationType.UNKNOWN

      if (definition.description.includes('交通枢纽') || definition.name.includes('站') || definition.name.includes('机场')) {
        type = LocationType.TRANSPORTATION_HUB
      } else if (definition.description.includes('商业') || definition.description.includes('商业区')) {
        type = LocationType.COMMERCIAL_AREA
      } else if (definition.description.includes('居民') || definition.description.includes('居民区')) {
        type = LocationType.RESIDENTIAL_AREA
      } else if (definition.description.includes('文化') || definition.description.includes('教育')) {
        type = LocationType.CULTURAL_AREA
      } else if (definition.description.includes('金融') || definition.description.includes('商务')) {
        type = LocationType.BUSINESS_DISTRICT
      }

      return Location.fromDefinition(definition, type)
    })
  }

  addVisit(): void {
    if (!this.visitsThisWeek.includes(this.name)) {
      this.visitsThisWeek.push(this.name)
    }
  }

  hasVisited(): boolean {
    return this.visitsThisWeek.includes(this.name)
  }

  getVisitsCount(): number {
    return this.visitsThisWeek.filter(city => city === this.name).length
  }

  resetVisits(): void {
    this.visitsThisWeek = this.visitsThisWeek.filter(city => city !== this.name)
  }

  getLocations(): Location[] {
    return this.locations
  }

  getLocationById(id: number): Location | undefined {
    return this.locations.find(loc => loc.id === id)
  }

  /**
   * 获取地点定义列表（配置数据）
   * 用于序列化或配置导出
   */
  getLocationDefinitions() {
    return this.cityConfig ? this.cityConfig.getLocations() : []
  }

  getTransportationHubs(): Location[] {
    return this.locations.filter(loc => loc.isTransportationHub())
  }

  getCurrentLocation(): Location | undefined {
    return this.locations[0]
  }

  /**
   * 获取城市商品定义列表
   * 返回商品配置模板，不包含运行时状态（价格、拥有数量）
   */
  getGoods(): GoodsDefinition[] {
    return this.cityConfig ? this.cityConfig.getGoods() : []
  }

  getBuildings(): BuildingConfig {
    if (!this.cityConfig) {
      // 返回默认的建筑配置
      return {
        bank: { name: '银行', icon: '🏦' },
        hospital: { name: '医院', icon: '🏥' },
        constructionSite: { name: '打工', icon: '💼' },
        postOffice: { name: '邮局', icon: '📬' },
        house: { name: '中介', icon: '🏠' }
      }
    }
    return this.cityConfig.getBuildings()
  }

  getEvents(): CityEvents {
    // Events are now handled by strategies
    return {
      commercial: this.cityConfig ? this.cityConfig.getEventStrategy().getCommercialEvents() : [],
      health: this.cityConfig ? this.cityConfig.getEventStrategy().getHealthEvents() : [],
      money: this.cityConfig ? this.cityConfig.getEventStrategy().getMoneyEvents() : []
    }
  }

  canVisit(maxVisits: number): boolean {
    const uniqueVisits = new Set(this.visitsThisWeek)
    return uniqueVisits.size < maxVisits || this.hasVisited()
  }
}
