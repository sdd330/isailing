import type { GameState } from '@/types/game'
import type { GameConfig, WorkTypeConfig, HouseTypeConfig } from '@/config/game.config'
import type { IMessageHandler } from '../interfaces/IMessageHandler'
import { BaseManager } from '../base/BaseManager'
import { Building, BuildingType } from '../models/Building'
import { Player } from '../models/Player'
import { City } from '../models/City'
import { LocationService } from '../services/LocationService'
import { PlaceService } from '../services/PlaceService'
import { Random } from '../utils/Random'
import { configManager, getCityKeyByName } from '@/config/theme.config'

export class BuildingManager extends BaseManager {
  private buildings: Map<BuildingType, Building> = new Map()
  
  // 租房相关常量
  private static readonly RENT_MULTIPLIER_MIN = 0.5  // 房租最低倍数
  private static readonly RENT_MULTIPLIER_MAX = 1.5  // 房租最高倍数
  private static readonly RENT_EVENT_PROBABILITY = 0.05  // 房租涨跌事件触发概率（5%）
  private static readonly RENT_INCREASE_MIN = 0.1  // 房租最低涨幅（10%）
  private static readonly RENT_INCREASE_MAX = 0.25  // 房租最高涨幅（25%）
  private static readonly RENT_DECREASE_MIN = 0.05  // 房租最低跌幅（5%）
  private static readonly RENT_DECREASE_MAX = 0.15  // 房租最高跌幅（15%）
  private static readonly DEPOSIT_MULTIPLIER = 1  // 押金倍数（一个月月租）
  private static readonly DISCOUNT_RATE = 0.5  // 折扣率（5折）
  private player: Player
  private city: City | null = null

  // 常量
  private static readonly DEFAULT_CITY = '上海'
  private static readonly DEFAULT_CITY_KEY = 'shanghai'
  private static readonly MAX_MONEY_EVENT_RATE = 10 // 金钱事件最高百分比
  private static readonly MIN_MONEY_DELTA = 5 // 最小金钱变化
  private static readonly MAX_MONEY_DELTA = 30 // 最大金钱变化

  constructor(
    state: GameState,
    config: GameConfig,
    messageHandler: IMessageHandler
  ) {
    super(state, config, messageHandler)
    this.player = new Player(state)
    this.updateCity()
    this.initializeBuildings()
  }

  private updateCity(): void {
    const cityList = configManager.getCityList()
    const cityInfo = cityList.find(c => c.name === this.state.currentCity)
    if (!cityInfo) {
      return
    }
    
    this.city = new City(
      cityInfo.name,
      cityInfo.shortName,
      [...this.state.cityVisitsThisWeek]
    )
  }

  private initializeBuildings(): void {
    const buildings = this.getCurrentCityBuildings()
    if (!buildings) {
      console.error('无法初始化建筑：缺少城市配置')
      return
    }

    this.buildings.set(BuildingType.BANK, new Building(
      BuildingType.BANK,
      buildings.bank.name,
      buildings.bank.icon,
      '存款取款服务',
      this.config
    ))

    this.buildings.set(BuildingType.HOSPITAL, new Building(
      BuildingType.HOSPITAL,
      buildings.hospital.name,
      buildings.hospital.icon,
      '治疗健康',
      this.config
    ))

    this.buildings.set(BuildingType.CONSTRUCTION_SITE, new Building(
      BuildingType.CONSTRUCTION_SITE,
      buildings.constructionSite?.name || '打工',
      buildings.constructionSite?.icon || '💼',
      buildings.constructionSite?.description || '选择工作类型赚取收入',
      this.config
    ))

    this.buildings.set(BuildingType.POST_OFFICE, new Building(
      BuildingType.POST_OFFICE,
      buildings.postOffice.name,
      buildings.postOffice.icon,
      buildings.postOffice.description || '',
      this.config
    ))

    this.buildings.set(BuildingType.HOUSE, new Building(
      BuildingType.HOUSE,
      buildings.house?.name || '中介',
      buildings.house?.icon || '🏠',
      buildings.house?.description || '',
      this.config
    ))

    if (buildings.restaurant) {
      this.buildings.set(BuildingType.RESTAURANT, new Building(
        BuildingType.RESTAURANT,
        buildings.restaurant.name || '饭店',
        buildings.restaurant.icon || '🍜',
        buildings.restaurant.description || '',
        this.config
      ))
    }

    if (buildings.subway) {
      this.buildings.set(BuildingType.SUBWAY, new Building(
        BuildingType.SUBWAY,
        buildings.subway.name || '地铁站',
        buildings.subway.icon || '🚇',
        buildings.subway.description || '',
        this.config
      ))
    }

    if (buildings.airport) {
      this.buildings.set(BuildingType.AIRPORT, new Building(
        BuildingType.AIRPORT,
        buildings.airport.name || '机场',
        buildings.airport.icon || '✈️',
        buildings.airport.description || '',
        this.config
      ))
    }

    if (buildings.trainStation) {
      this.buildings.set(BuildingType.TRAIN_STATION, new Building(
        BuildingType.TRAIN_STATION,
        buildings.trainStation.name || '火车站',
        buildings.trainStation.icon || '🚄',
        buildings.trainStation.description || '',
        this.config
      ))
    }
  }

  getBuilding(type: BuildingType): Building | undefined {
    return this.buildings.get(type)
  }

  getAllBuildings(): Building[] {
    return Array.from(this.buildings.values())
  }

  updateBuildingsForCity(cityName: string): void {
    const cityList = configManager.getCityList()
    const cityInfo = cityList.find(c => c.name === cityName)
    if (cityInfo) {
      this.city = new City(
        cityInfo.name,
        cityInfo.shortName,
        [...this.state.cityVisitsThisWeek]
      )
      this.initializeBuildings()
    }
  }

  setCity(city: City): void {
    this.city = city
    this.initializeBuildings()
  }

  getCurrentCity(): City | null {
    return this.city
  }

  hospitalTreatment(points: number): boolean {
    const hospital = this.getBuilding(BuildingType.HOSPITAL)
    if (!hospital) {
      return false
    }

    if (this.player.health >= 100) {
      this.showMessage("小护士笑着说：\"你看起来气色很好，不需要治疗。\"")
      return false
    }

    const cost = points * (hospital.getInfo().costPerPoint || 0)
    if (!this.player.canAfford(cost)) {
      this.showMessage("医生说：\"钱不够！拒绝治疗！\"")
      return false
    }

    const oldHealth = this.player.health
    this.player.subtractCash(cost)
    this.player.addHealth(points)
    
    this.showMessage(`治疗成功！健康从${oldHealth}点恢复到${this.player.health}点，花费${cost.toLocaleString()}元`)
    return true
  }

  /**
   * 获取当前城市的建筑配置（合并全局和城市配置）
   */
  private getCurrentCityBuildings() {
    const cityKey = getCityKeyByName(this.state.currentCity || BuildingManager.DEFAULT_CITY)
    const cityConfig = configManager.getCityConfig(cityKey) || configManager.getCityConfig(BuildingManager.DEFAULT_CITY_KEY)
    
    if (!cityConfig) {
      console.error('无法获取城市配置')
      return null
    }
    
    const globalBuildings = configManager.getGameConfig().buildings
    const cityBuildings = cityConfig.getBuildings()
    return { ...globalBuildings, ...cityBuildings }
  }

  /**
   * 获取指定城市的房型配置
   */
  private getCityHouseTypes(cityName: string): HouseTypeConfig[] {
    const cityKey = getCityKeyByName(cityName) || BuildingManager.DEFAULT_CITY_KEY
    const cityConfig = configManager.getCityConfig(cityKey) || configManager.getCityConfig(BuildingManager.DEFAULT_CITY_KEY)
    
    if (!cityConfig) {
      console.warn(`无法获取城市 ${cityName} 的配置`)
      return []
    }

    const globalBuildings = configManager.getGameConfig().buildings
    const cityBuildings = cityConfig.getBuildings()
    const buildings = { ...globalBuildings, ...cityBuildings }
    
    return buildings.house?.houseTypes || []
  }

  /**
   * 计算押金（考虑折扣和首次/换房）
   * @param houseType 房型配置
   * @param cityName 城市名称
   * @returns 押金金额
   */
  private calculateDeposit(houseType: HouseTypeConfig, cityName: string): number {
    const monthlyRent = this.calculateMonthlyRent(cityName, houseType)

    // 基础押金：一个月月租
    const baseDeposit = monthlyRent * BuildingManager.DEPOSIT_MULTIPLIER
    
    // 如果达到折扣阈值，押金打5折
    if (this.canGetDiscount(houseType)) {
      return Math.floor(baseDeposit * BuildingManager.DISCOUNT_RATE)
    }
    
    return baseDeposit
  }

  /**
   * 检查是否首次在该城市租房
   */
  private isFirstTimeRenting(cityName: string): boolean {
    this.ensureRentStateInitialized()
    return !this.state.rentedCities.includes(cityName)
  }

  /**
   * 检查是否可以享受折扣
   */
  private canGetDiscount(houseType: HouseTypeConfig): boolean {
    return houseType.discountThreshold !== undefined 
      && this.player.canAfford(houseType.discountThreshold)
  }

  /**
   * 确保租房状态数据结构已初始化
   */
  private ensureRentStateInitialized(): void {
    if (!this.state.rentedCities) {
      this.state.rentedCities = []
    }
    if (!this.state.rentedHouses) {
      this.state.rentedHouses = {}
    }
    if (!this.state.rentMultipliers) {
      this.state.rentMultipliers = {}
    }
  }

  /**
   * 处理房租涨跌事件
   * 每周有一定概率触发房租涨跌
   */
  processRentEvents(): void {
    this.ensureRentStateInitialized()
    
    const rentedCities = this.state.rentedCities || []
    if (rentedCities.length === 0) {
      return
    }

    // 每个已租房的城市有一定概率触发房租涨跌事件
    for (const cityName of rentedCities) {
      if (Math.random() < BuildingManager.RENT_EVENT_PROBABILITY) {
        this.triggerRentEvent(cityName)
      }
    }
  }

  /**
   * 触发单个城市的房租涨跌事件
   */
  private triggerRentEvent(cityName: string): void {
    const houseType = this.getRentedHouseType(cityName)
    if (!houseType) {
      return
    }

    // 随机决定是涨还是跌（50%概率）
    const isIncrease = Math.random() < 0.5
    const changeRate = this.calculateRentChangeRate(isIncrease)

    // 更新房租涨跌比例
    const currentMultiplier = this.getRentMultiplier(cityName)
    const newMultiplier = currentMultiplier + changeRate
    this.setRentMultiplier(cityName, newMultiplier)

    // 计算新旧月租并显示消息
    this.showRentChangeMessage(cityName, houseType, currentMultiplier, newMultiplier, isIncrease, changeRate)
  }

  /**
   * 计算房租涨跌幅度
   */
  private calculateRentChangeRate(isIncrease: boolean): number {
    if (isIncrease) {
      // 涨幅：10% - 25%
      return BuildingManager.RENT_INCREASE_MIN + 
        Math.random() * (BuildingManager.RENT_INCREASE_MAX - BuildingManager.RENT_INCREASE_MIN)
    } else {
      // 跌幅：5% - 15%
      return -(BuildingManager.RENT_DECREASE_MIN + 
        Math.random() * (BuildingManager.RENT_DECREASE_MAX - BuildingManager.RENT_DECREASE_MIN))
    }
  }

  /**
   * 显示房租涨跌消息
   */
  private showRentChangeMessage(
    cityName: string,
    houseType: HouseTypeConfig,
    oldMultiplier: number,
    newMultiplier: number,
    isIncrease: boolean,
    changeRate: number
  ): void {
    // 计算基础月租（不考虑涨跌）
    const baseRent = this.calculateBaseMonthlyRent(cityName, houseType)
    const oldRent = Math.floor(baseRent * oldMultiplier)
    const newRent = Math.floor(baseRent * newMultiplier)
    const changePercent = Math.abs(changeRate * 100).toFixed(1)

    const direction = isIncrease ? '上涨' : '下跌'
    const emoji = isIncrease ? '📈' : '📉'
    const changeVerb = isIncrease ? '涨至' : '降至'
    
    this.showMessage(
      `${emoji} [${cityName}] 房租${direction}！` +
      `由于市场波动，你租的${houseType.name}月租从${oldRent.toLocaleString()}元` +
      `${changeVerb}${newRent.toLocaleString()}元（${direction}${changePercent}%）。`
    )
  }

  /**
   * 计算基础月租（不考虑涨跌事件）
   */
  private calculateBaseMonthlyRent(cityName: string, houseType: HouseTypeConfig): number {
    let monthlyRent = houseType.monthlyRent || 0
    
    if (monthlyRent <= 0) {
      return 0
    }

    // 获取城市配置和租金策略
    const cityKey = getCityKeyByName(cityName) || BuildingManager.DEFAULT_CITY_KEY
    const cityConfig = configManager.getCityConfig(cityKey)
    
    if (cityConfig) {
      const rentStrategy = cityConfig.getRentStrategy()
      const baseRent = rentStrategy.getBaseRent()
      const referenceRent = 5000 // 参考租金（上海一室一厅的月租）
      
      if (baseRent > 0 && referenceRent > 0) {
        const adjustmentFactor = baseRent / referenceRent
        const clampedFactor = Math.max(0.8, Math.min(1.2, adjustmentFactor))
        monthlyRent = Math.floor(monthlyRent * clampedFactor)
      }
    }

    return Math.max(1, monthlyRent)
  }

  /**
   * 获取指定城市已租的房型
   */
  private getRentedHouseType(cityName: string): HouseTypeConfig | null {
    this.ensureRentStateInitialized()
    const houseTypeId = this.state.rentedHouses[cityName]
    if (!houseTypeId) {
      return null
    }

    const houseTypes = this.getCityHouseTypes(cityName)
    return houseTypes.find(ht => ht.id === houseTypeId) || null
  }

  /**
   * 动态计算月租
   * 基于房型配置的基础月租，结合城市策略、房租涨跌事件动态计算
   * @param cityName 城市名称
   * @param houseType 房型配置
   * @returns 计算后的月租
   */
  calculateMonthlyRent(cityName: string, houseType: HouseTypeConfig): number {
    // 基础月租从房型配置获取
    let monthlyRent = houseType.monthlyRent || 0
    
    if (monthlyRent <= 0) {
      return 0
    }

    // 获取城市配置和租金策略
    const cityKey = getCityKeyByName(cityName) || BuildingManager.DEFAULT_CITY_KEY
    const cityConfig = configManager.getCityConfig(cityKey)
    
    if (cityConfig) {
      const rentStrategy = cityConfig.getRentStrategy()
      const baseRent = rentStrategy.getBaseRent()
      
      // 可以根据城市的基础租金进行微调
      // 例如：月租 = 房型基础月租 * (城市基础租金 / 参考租金)
      // 这里使用简单的线性调整，可以根据需要扩展
      const referenceRent = 5000 // 参考租金（上海一室一厅的月租）
      if (baseRent > 0 && referenceRent > 0) {
        const adjustmentFactor = baseRent / referenceRent
        // 调整范围在 0.8 到 1.2 之间，避免波动过大
        const clampedFactor = Math.max(0.8, Math.min(1.2, adjustmentFactor))
        monthlyRent = Math.floor(monthlyRent * clampedFactor)
      }
    }

    // 应用房租涨跌事件的影响
    const rentMultiplier = this.getRentMultiplier(cityName)
    monthlyRent = Math.floor(monthlyRent * rentMultiplier)

    // 确保月租至少为1
    return Math.max(1, monthlyRent)
  }

  /**
   * 获取城市的房租涨跌倍数
   */
  private getRentMultiplier(cityName: string): number {
    this.ensureRentStateInitialized()
    return this.state.rentMultipliers[cityName] || 1.0
  }

  /**
   * 设置城市的房租涨跌倍数
   */
  private setRentMultiplier(cityName: string, multiplier: number): void {
    this.ensureRentStateInitialized()
    // 限制在合理范围内
    const clampedMultiplier = Math.max(
      BuildingManager.RENT_MULTIPLIER_MIN,
      Math.min(BuildingManager.RENT_MULTIPLIER_MAX, multiplier)
    )
    this.state.rentMultipliers[cityName] = clampedMultiplier
  }

  /**
   * 获取可用的工作类型列表
   */
  getWorkTypes(): WorkTypeConfig[] {
    const buildings = this.getCurrentCityBuildings()
    if (!buildings) {
      return []
    }
    
    const workTypes = buildings.constructionSite?.workTypes || []
    
    if (workTypes.length === 0) {
      console.warn(`城市 ${this.state.currentCity} 未配置工作类型，请检查配置`)
      return []
    }
    
    return workTypes
  }

  /**
   * 验证工作前置条件
   * @param workType 工作类型配置
   * @param staminaCost 体力消耗（已计算）
   * @returns 错误消息，null 表示验证通过
   */
  private validateWorkPreconditions(workType: WorkTypeConfig, staminaCost: number): string | null {
    // 检查健康值
    if (this.player.health <= 0) {
      return "健康值过低，无法打工！请先去医院治疗。"
    }

    // 检查押金
    if (workType.cost && workType.cost > 0) {
      if (!this.player.canAfford(workType.cost)) {
        return `现金不足，无法${workType.name}！需要先支付押金${workType.cost}元。`
      }
    }

    // 检查每日次数限制
    if (workType.dailyLimit && workType.dailyLimit > 0) {
      const visitCount = this.state.workVisits[workType.id] || 0
      if (visitCount >= workType.dailyLimit) {
        return `今天${workType.name}次数已达上限（${workType.dailyLimit}次）！明天再来吧。`
      }
    }

    // 检查体力
    if (this.state.stamina <= 0 || this.state.stamina < staminaCost) {
      return `你现在太累了，没力气去${workType.name}工作了，先休息或去饭店补充体力吧。`
    }

    return null
  }

  /**
   * 执行工作
   * @param workTypeId 工作类型ID
   */
  doWork(workTypeId: string = 'construction'): boolean {
    const workBuilding = this.getBuilding(BuildingType.CONSTRUCTION_SITE)
    if (!workBuilding) {
      return false
    }

    // 获取工作类型配置
    const workTypes = this.getWorkTypes()
    const workType = workTypes.find(w => w.id === workTypeId)
    
    if (!workType) {
      this.showMessage(`未找到工作类型：${workTypeId}`)
      return false
    }

    // 计算体力消耗
    const staminaCost = Random.range(workType.staminaCostRange[0], workType.staminaCostRange[1])
    
    // 验证前置条件
    const errorMsg = this.validateWorkPreconditions(workType, staminaCost)
    if (errorMsg) {
      this.showMessage(errorMsg)
      return false
    }

    const oldStamina = this.state.stamina

    // 支付押金
    if (workType.cost && workType.cost > 0) {
      this.player.subtractCash(workType.cost)
    }

    // 更新访问次数
    if (workType.dailyLimit && workType.dailyLimit > 0) {
      this.state.workVisits[workType.id] = (this.state.workVisits[workType.id] || 0) + 1
    }

    // 计算并发放收入
    const income = Random.range(workType.incomeRange[0], workType.incomeRange[1])
    this.player.addCash(income)

    // 消耗体力
    this.player.subtractStamina(staminaCost)

    // 显示结果消息
    const staminaDelta = oldStamina - this.state.stamina
    const staminaText = staminaDelta > 0 ? `，体力-${staminaDelta}` : ''
    const costText = workType.cost ? `（押金${workType.cost}元）` : ''
    this.showMessage(`${workType.icon} ${workType.name}工作完成，获得${income}元收入${costText}！消耗了体力${staminaText}`)

    // 触发工作相关事件
    this.triggerWorkEvents(workType.name)

    return true
  }



  /**
   * 在饭店用餐
   * - 消耗现金
   * - 恢复体力
   * - 可能触发食物中毒
   */
  eatAtRestaurant(): boolean {
    const restaurant = this.getBuilding(BuildingType.RESTAURANT)
    if (!restaurant) {
      return false
    }

    const cfg = this.config.buildings.restaurant
    const costRange = cfg?.costRange ?? [60, 120]
    const staminaRange = cfg?.staminaGain ?? [15, 30]
    const poisoningChance = cfg?.foodPoisoningChance ?? 15
    const poisoningDamageRange = cfg?.foodPoisoningDamage ?? [5, 15]

    const cost = Random.range(costRange[0], costRange[1])

    if (!this.player.canAfford(cost)) {
      this.showMessage('你掏了掏口袋，服务员摇头说："钱不够，这顿先免了吧。"')
      return false
    }

    const beforeCash = this.player.cash
    this.player.subtractCash(cost)

    // 恢复体力
    const staminaGain = Random.range(staminaRange[0], staminaRange[1])
    const beforeStamina = this.state.stamina
    this.player.addStamina(staminaGain)

    let message =
      `你在路边小饭店吃了一顿热乎的，花了${cost.toLocaleString()}元，` +
      `体力从${beforeStamina}点恢复到${this.state.stamina}点（+${staminaGain}点）。`

    // 判定食物中毒
    const roll = Random.num(100)
    if (roll < poisoningChance) {
      const damage = Random.range(poisoningDamageRange[0], poisoningDamageRange[1])
      const beforeHealth = this.player.health
      this.player.subtractHealth(damage)
      message += `\n不过这家店的卫生似乎不太行，你有点肚子不舒服，健康从${beforeHealth}点降到${this.player.health}点（-${damage}点）。`
    }

    this.showMessage(message)

    // 触发工作相关事件
    this.triggerWorkEvents('吃饭')

    return true
  }


  /**
   * 处理月度房租
   * 根据每个城市租的房型来计算月租
   */
  processRent(): void {
    this.ensureRentStateInitialized()

    const rentedCities = this.state.rentedCities || []
    if (rentedCities.length === 0) {
      return
    }

    // 遍历所有已租房的城市
    for (const cityName of rentedCities) {
      const houseType = this.getRentedHouseType(cityName)
      if (!houseType) {
        // 无效的租房记录会在 loadRentInfoForCity 中清理，这里只记录警告
        console.warn(`城市 ${cityName} 的租房记录无效，跳过月租处理`)
        continue
      }

      // 动态计算月租（基于房型配置和城市策略）
      const monthlyRent = this.calculateMonthlyRent(cityName, houseType)
      if (monthlyRent <= 0) {
        continue
      }

      // 处理该城市的月租
      this.processCityRent(cityName, houseType, monthlyRent)
    }
  }

  /**
   * 处理单个城市的月租
   */
  private processCityRent(cityName: string, houseType: HouseTypeConfig, monthlyRent: number): void {
    // 可以正常支付房租
    if (this.player.canAfford(monthlyRent)) {
      const before = this.player.cash
      this.player.subtractCash(monthlyRent)
      this.showMessage(`[${cityName}] ${houseType.icon} ${houseType.name} 本月房租 ${monthlyRent.toLocaleString()} 元已扣除，现金从 ${before.toLocaleString()} 元降至 ${this.player.cash.toLocaleString()} 元。`)
      return
    }

    // 无法支付房租，触发清仓和降级
    this.handleRentEviction(cityName, houseType, monthlyRent)
  }

  /**
   * 处理因无法支付房租而被赶出
   */
  private handleRentEviction(cityName: string, houseType: HouseTypeConfig, monthlyRent: number): void {
    const baseCapacity = this.state.baseCapacity || this.config.initial.capacity
    const cashBefore = this.player.cash
    
    // 把现有现金全部交给房东
    if (cashBefore > 0) {
      this.player.subtractCash(cashBefore)
    }

    // 处理超出的商品
    const recovered = this.sellExcessGoods(baseCapacity)

    // 清理该城市的租房状态
    this.removeRentRecord(cityName)

    // 降级容量
    this.state.maxCapacity = baseCapacity

    // 显示消息
    this.showEvictionMessage(cityName, houseType, monthlyRent, baseCapacity, recovered)
  }

  /**
   * 移除租房记录
   */
  private removeRentRecord(cityName: string): void {
    this.state.rentedCities = this.state.rentedCities.filter(c => c !== cityName)
    delete this.state.rentedHouses[cityName]
    delete this.state.rentMultipliers[cityName]
  }

  /**
   * 显示被赶出消息
   */
  private showEvictionMessage(
    cityName: string,
    houseType: HouseTypeConfig,
    monthlyRent: number,
    baseCapacity: number,
    recovered: number
  ): void {
    this.showMessage(
      `[${cityName}] 你未能支付${houseType.name}本月房租 ${monthlyRent.toLocaleString()} 元，被房东赶出了房子。` +
      `你只能带走行李箱中的 ${baseCapacity} 件商品，其余商品被房东低价甩卖，为你回收了 ${recovered.toLocaleString()} 元现金。`
    )
  }

  /**
   * 卖出超出容量的商品
   * @param baseCapacity 基础容量
   * @returns 回收的现金
   */
  private sellExcessGoods(baseCapacity: number): number {
    let over = Math.max(0, this.state.totalGoods - baseCapacity)
    if (over <= 0) {
      return 0
    }

    let recovered = 0
    const ownedGoods = this.state.goods.filter(g => g.owned > 0)
    
    // 先卖出高价商品
    ownedGoods.sort((a, b) => (b.price || 0) - (a.price || 0))

    for (const g of ownedGoods) {
      if (over <= 0) break
      const sellCount = Math.min(g.owned, over)
      if (sellCount <= 0) continue

      if (g.price > 0) {
        recovered += g.price * sellCount
      }
      g.owned -= sellCount
      this.state.totalGoods -= sellCount
      over -= sellCount
    }

    // 若仍有多余商品（价格可能为0），继续清空
    if (over > 0) {
      for (const g of ownedGoods) {
        if (over <= 0) break
        const sellCount = Math.min(g.owned, over)
        if (sellCount <= 0) continue
        g.owned -= sellCount
        this.state.totalGoods -= sellCount
        over -= sellCount
      }
    }

    if (recovered > 0) {
      this.player.addCash(recovered)
    }

    return recovered
  }


  /**
   * 乘坐地铁前往火车站或机场（只收取地铁票价，由上层继续选择高铁/飞机）
   */
  takeSubway(target: 'train' | 'airport'): boolean {
    const subway = this.getBuilding(BuildingType.SUBWAY)
    if (!subway) {
      return false
    }

    const currentCityName = this.state.currentCity
    const cityKey = getCityKeyByName(currentCityName)
    const fare = configManager.getSubwayFare(cityKey)
    if (!fare || fare <= 0) {
      this.showMessage('当前城市暂未开通地铁线路。')
      return false
    }

    if (!this.player.canAfford(fare)) {
      this.showMessage(`现金不足，无法乘坐地铁（需要${fare.toLocaleString()}元）。`)
      return false
    }

    this.player.subtractCash(fare)

    // 根据当前城市和目标决定更真实的站点名称
    let targetName = '火车站'
    if (target === 'airport') {
      if (currentCityName === '北京') {
        targetName = '首都机场'
      } else if (currentCityName === '上海') {
        targetName = '浦东机场'
      } else if (currentCityName === '广州') {
        targetName = '白云机场'
      } else {
        targetName = '机场'
      }
    } else {
      if (currentCityName === '北京') {
        targetName = '北京站'
      } else if (currentCityName === '上海') {
        targetName = '虹桥火车站'
      } else if (currentCityName === '广州') {
        targetName = '广州南站'
      } else {
        targetName = '火车站'
      }
    }

    // 地铁行程行李风险：概率较低，例如 5%
    this.applyLuggageRisk('subway', currentCityName, targetName)

    this.showMessage(`你乘坐地铁前往${targetName}，花费${fare.toLocaleString()}元。`)
    return true
  }

  /**
   * 出行途中丢失行李的通用逻辑：
   * - mode 用于区分地铁 / 高铁 / 飞机，控制概率和文案
   * - from/to 仅用于提示文本
   */
  private applyLuggageRisk(
    mode: 'subway' | 'train' | 'plane',
    from: string,
    to: string
  ): void {
    if (this.state.totalGoods <= 0) return

    const baseProbability =
      mode === 'subway' ? 5
        : mode === 'train' ? 10
          : 12 // plane

    const roll = Math.random() * 100
    if (roll >= baseProbability) return

    // 清空所有随身商品
    this.state.goods.forEach(g => {
      g.owned = 0
    })
    this.state.totalGoods = 0

    const label = mode === 'subway' ? '地铁'
      : mode === 'train' ? '高铁'
        : '飞机'

    this.showMessage(
      `你在从${from}乘坐${label}前往${to}的途中，一时大意行李箱被人顺走，里面的货全没了！\n` +
      `好在人没事，只能重新去黑市想办法东山再起……`
    )
  }

  /**
   * 获取可用的房型列表
   */
  getHouseTypes(): HouseTypeConfig[] {
    const currentCity = this.state.currentCity || BuildingManager.DEFAULT_CITY
    const houseTypes = this.getCityHouseTypes(currentCity)
    
    if (houseTypes.length === 0) {
      // 如果没有配置房型，使用全局默认配置
      const defaultConfig = this.config.buildings.house
      return defaultConfig?.houseTypes || []
    }
    
    return houseTypes
  }

  /**
   * 获取当前城市已租的房型
   */
  getCurrentCityRentedHouseType(): HouseTypeConfig | null {
    this.ensureRentStateInitialized()
    const currentCity = this.state.currentCity || BuildingManager.DEFAULT_CITY
    const houseTypeId = this.state.rentedHouses[currentCity]
    
    if (!houseTypeId) {
      return null
    }

    const houseTypes = this.getHouseTypes()
    return houseTypes.find(ht => ht.id === houseTypeId) || null
  }

  /**
   * 获取当前城市已租房型的实际月租（动态计算）
   */
  getCurrentCityRentedHouseMonthlyRent(): number {
    const houseType = this.getCurrentCityRentedHouseType()
    if (!houseType) {
      return 0
    }
    
    const currentCity = this.state.currentCity || BuildingManager.DEFAULT_CITY
    return this.calculateMonthlyRent(currentCity, houseType)
  }

  /**
   * 检查当前城市是否已租房
   */
  hasRentedHouseInCurrentCity(): boolean {
    const currentCity = this.state.currentCity || BuildingManager.DEFAULT_CITY
    this.ensureRentStateInitialized()
    return this.state.rentedCities.includes(currentCity)
  }

  /**
   * 加载并恢复指定城市的租房信息
   * 切换城市时调用，确保租房状态和容量正确
   * @param cityName 城市名称
   */
  loadRentInfoForCity(cityName: string): void {
    this.ensureRentStateInitialized()
    
    // 检查该城市是否已租房
    const hasRented = this.state.rentedCities.includes(cityName)
    if (!hasRented) {
      // 该城市未租房，无需恢复
      return
    }

    // 获取该城市租的房型
    const houseTypeId = this.state.rentedHouses[cityName]
    if (!houseTypeId) {
      // 有租房记录但没有房型ID，可能是数据不一致，清理一下
      this.state.rentedCities = this.state.rentedCities.filter(c => c !== cityName)
      return
    }

    // 获取房型配置
    const houseTypes = this.getCityHouseTypes(cityName)
    const houseType = houseTypes.find(ht => ht.id === houseTypeId)
    
    if (!houseType) {
      // 房型配置不存在，可能是配置变更，清理租房记录
      console.warn(`城市 ${cityName} 的房型 ${houseTypeId} 配置不存在，清理租房记录`)
      this.state.rentedCities = this.state.rentedCities.filter(c => c !== cityName)
      delete this.state.rentedHouses[cityName]
      return
    }

    // 确保容量已包含该房型的容量增加
    // 注意：maxCapacity 是全局的，包含所有城市租房的容量增加总和
    // 这里只需要确保租房记录存在即可，容量在租房时已经累加
    // 但如果切换城市时容量被重置了，需要重新计算
    
    // 计算应该有的总容量（基础容量 + 所有已租房型的容量增加）
    const baseCapacity = this.state.baseCapacity || this.config.initial.capacity
    let totalCapacityIncrease = 0
    
    for (const [rentedCity, rentedHouseTypeId] of Object.entries(this.state.rentedHouses)) {
      const rentedHouseTypes = this.getCityHouseTypes(rentedCity)
      const rentedHouseType = rentedHouseTypes.find(ht => ht.id === rentedHouseTypeId)
      if (rentedHouseType) {
        totalCapacityIncrease += rentedHouseType.capacityIncrease
      }
    }
    
    const expectedMaxCapacity = baseCapacity + totalCapacityIncrease
    
    // 如果当前 maxCapacity 小于预期值，说明容量丢失了，需要恢复
    if (this.state.maxCapacity < expectedMaxCapacity) {
      this.state.maxCapacity = expectedMaxCapacity
      console.log(`恢复城市 ${cityName} 的租房容量，当前总容量：${this.state.maxCapacity}`)
    }
  }

  /**
   * 租房
   * @param houseTypeId 房型ID
   */
  rentHouse(houseTypeId: string): boolean {
    // 验证建筑存在
    if (!this.validateHouseBuilding()) {
      return false
    }

    // 获取并验证房型配置
    const houseType = this.getHouseTypeById(houseTypeId)
    if (!houseType) {
      return false
    }

    // 初始化状态
    this.ensureRentStateInitialized()
    const currentCity = this.player.currentCity
    
    // 检查是否首次租房
    const isFirstTime = this.isFirstTimeRenting(currentCity)
    const previousHouseTypeId = this.state.rentedHouses[currentCity]

    // 计算新房费用
    const actualMonthlyRent = this.calculateMonthlyRent(currentCity, houseType)
    const newDeposit = this.calculateDeposit(houseType, currentCity)

    // 计算净支付金额（新房押金 - 旧房押金退款）
    let netPayment = newDeposit
    let refundAmount = 0

    if (previousHouseTypeId && previousHouseTypeId !== houseTypeId) {
      // 计算旧房押金退款
      const houseTypes = this.getCityHouseTypes(currentCity)
      const previousHouseType = houseTypes.find(ht => ht.id === previousHouseTypeId)
      if (previousHouseType) {
        const previousMonthlyRent = this.calculateMonthlyRent(currentCity, previousHouseType)
        refundAmount = previousMonthlyRent * BuildingManager.DEPOSIT_MULTIPLIER
        netPayment = newDeposit - refundAmount
      }
    }

    // 验证资金（检查净支付金额）
    if (netPayment > 0 && !this.player.canAfford(netPayment)) {
      this.showMessage(`现金不足，无法换房！需要净支付${netPayment.toLocaleString()}元。（新房押金${newDeposit.toLocaleString()}元 - 旧房押金退款${refundAmount.toLocaleString()}元）`)
      return false
    }

    // 处理换房逻辑（退还旧房押金）
    if (previousHouseTypeId && previousHouseTypeId !== houseTypeId) {
      this.handleHouseSwitch(currentCity, previousHouseTypeId, houseTypeId)
    }

    // 执行租房操作（支付新房押金）
    this.executeRent(currentCity, houseType, newDeposit, isFirstTime, previousHouseTypeId, actualMonthlyRent)
    
    return true
  }

  /**
   * 验证中介建筑是否存在
   */
  private validateHouseBuilding(): boolean {
    const house = this.getBuilding(BuildingType.HOUSE)
    if (!house) {
      this.showMessage('当前城市没有中介，无法租房！')
      return false
    }
    return true
  }

  /**
   * 根据ID获取房型配置
   */
  private getHouseTypeById(houseTypeId: string): HouseTypeConfig | null {
    const houseTypes = this.getHouseTypes()
    const houseType = houseTypes.find(ht => ht.id === houseTypeId)
    
    if (!houseType) {
      this.showMessage(`未找到房型：${houseTypeId}`)
      return null
    }
    
    return houseType
  }

  /**
   * 验证押金是否足够
   */
  private validateDeposit(deposit: number, houseType: HouseTypeConfig, isFirstTime: boolean): boolean {
    if (this.player.canAfford(deposit)) {
      return true
    }

    this.showMessage(`现金不足，无法租${houseType.name}！需要押金（一个月月租）${deposit.toLocaleString()}元。`)
    return false
  }

  /**
   * 处理换房逻辑（减去之前房型的容量并退还押金）
   */
  private handleHouseSwitch(cityName: string, previousHouseTypeId: string, newHouseTypeId: string): void {
    const houseTypes = this.getCityHouseTypes(cityName)
    const previousHouseType = houseTypes.find(ht => ht.id === previousHouseTypeId)

    if (previousHouseType) {
      // 退还之前房子的押金（一个月月租）
      const previousMonthlyRent = this.calculateMonthlyRent(cityName, previousHouseType)
      const previousDeposit = previousMonthlyRent * BuildingManager.DEPOSIT_MULTIPLIER

      // 退还押金给玩家
      this.player.addCash(previousDeposit)
      this.showMessage(`换房退还之前房子的押金${previousDeposit.toLocaleString()}元。`)

      // 减去之前房型的容量增加
      const previousCapacityIncrease = previousHouseType.capacityIncrease
      const baseCapacity = this.state.baseCapacity || this.config.initial.capacity
      this.state.maxCapacity = Math.max(baseCapacity, this.state.maxCapacity - previousCapacityIncrease)
    }
  }

  /**
   * 执行租房操作
   */
  private executeRent(
    cityName: string,
    houseType: HouseTypeConfig,
    deposit: number,
    isFirstTime: boolean,
    previousHouseTypeId: string | undefined,
    actualMonthlyRent: number
  ): void {
    // 支付押金并增加容量
    this.player.subtractCash(deposit)
    this.player.increaseCapacity(houseType.capacityIncrease)

    // 更新租房记录
    if (isFirstTime) {
      this.state.rentedCities.push(cityName)
    }
    this.state.rentedHouses[cityName] = houseType.id

    // 显示成功消息
    this.showRentSuccessMessage(houseType, deposit, isFirstTime, previousHouseTypeId, actualMonthlyRent)
  }

  /**
   * 显示租房成功消息
   */
  private showRentSuccessMessage(
    houseType: HouseTypeConfig,
    deposit: number,
    isFirstTime: boolean,
    previousHouseTypeId: string | undefined,
    actualMonthlyRent: number
  ): void {
    const baseDeposit = actualMonthlyRent * BuildingManager.DEPOSIT_MULTIPLIER

    const discountText = deposit < baseDeposit ? '（享受折扣）' : ''
    const depositType = '押金（一个月月租）'
    
    // 构建换房提示
    let previousText = ''
    if (previousHouseTypeId && previousHouseTypeId !== houseType.id) {
      const houseTypes = this.getHouseTypes()
      const previousHouseType = houseTypes.find(ht => ht.id === previousHouseTypeId)
      if (previousHouseType) {
        previousText = `你退掉了之前的${previousHouseType.name}，`
      }
    }
    
    this.showMessage(
      `${previousText}${houseType.icon} 成功租下${houseType.name}${discountText}！` +
      `${depositType}${deposit.toLocaleString()}元，月租${actualMonthlyRent.toLocaleString()}元/月。`
    )
  }


  checkForcedHospitalization(): boolean {
    const hospital = this.getBuilding(BuildingType.HOSPITAL)
    if (!hospital) {
      return false
    }

    const triggerHealth = hospital.getInfo().triggerHealth || 85
    
    if (this.player.health < triggerHealth && this.player.timeLeft > 3) {
      const delayDays = 1 + Math.floor(Math.random() * 2)
      const hospitalCost = delayDays * (1000 + Math.floor(Math.random() * 8500))
      
      this.player.addDebt(hospitalCost)
      
      const healthRestored = 10
      this.player.addHealth(healthRestored)
      
      for (let i = 0; i < delayDays; i++) {
        this.player.decreaseTime()
      }
      
      const location = this.getRandomLocation()
      const place = PlaceService.getRandomPlaceForCity(this.player.currentCity)
      this.showMessage(`你的健康状况太差，被抬进医院治疗了${delayDays}天。\n村长好心为你垫付了住院费${hospitalCost.toLocaleString()}元。\n健康恢复了${healthRestored}点。`)
      
      return true
    }
    
    if (this.player.health < 20 && this.player.health > 0) {
      this.showMessage("你的健康状况非常危险，请尽快去医院治疗！")
      return false
    }
    
    return false
  }

  private getRandomLocation(): string {
    if (!this.city) {
      this.updateCity()
    }
    
    if (this.city) {
      return LocationService.getRandomLocationName(this.city)
    }
    
    return '某地'
  }

  /**
   * 触发工作相关事件（健康事件和金钱事件）
   * @param context 事件上下文描述（如"送外卖"、"打工"、"吃饭"等）
   */
  private triggerWorkEvents(context: string): void {
    const cityKey = getCityKeyByName(this.state.currentCity || BuildingManager.DEFAULT_CITY)
    
    this.triggerHealthEvent(cityKey, context)
    this.triggerMoneyEvent(cityKey, context)
  }

  /**
   * 触发健康事件
   */
  private triggerHealthEvent(cityKey: string, context: string): void {
    const healthEvents = configManager.getRandomEvents(cityKey, 'health') as any[]
    if (!healthEvents || healthEvents.length === 0) {
      return
    }

    const event = healthEvents[Math.floor(Math.random() * healthEvents.length)]
    if (!event?.damage) {
      return
    }

    const damage = Math.max(1, Math.floor(event.damage))
    const oldHealth = this.player.health
    this.player.subtractHealth(damage)
    this.showMessage(`🚑 ${event.message}（${context}）\n健康从${oldHealth}点降至${this.player.health}点（-${damage}点）`)
  }

  /**
   * 触发金钱事件
   */
  private triggerMoneyEvent(cityKey: string, context: string): void {
    const moneyEvents = configManager.getRandomEvents(cityKey, 'money') as any[]
    if (!moneyEvents || moneyEvents.length === 0) {
      return
    }

    const event = moneyEvents[Math.floor(Math.random() * moneyEvents.length)]
    if (!event) {
      return
    }

    const delta = this.calculateMoneyDelta(event)
    if (delta === 0) {
      return
    }

    const before = this.player.cash
    if (delta > 0) {
      this.player.addCash(delta)
    } else {
      this.player.subtractCash(Math.abs(delta))
    }
    const after = this.player.cash
    const absDelta = Math.abs(delta)
    const deltaText = delta > 0 ? `赚了 ${absDelta.toLocaleString()} 元！` : `损失了 ${absDelta.toLocaleString()} 元。`
    this.showMessage(`💰 ${event.message}（${context}），现金从${before.toLocaleString()}元${delta > 0 ? '增至' : '降至'}${after.toLocaleString()}元，${deltaText}`)
  }

  /**
   * 计算金钱事件的变化金额
   */
  private calculateMoneyDelta(event: any): number {
    if (typeof event.cashMultiplier === 'number' && event.cashMultiplier !== 0) {
      const rate = Math.min(BuildingManager.MAX_MONEY_EVENT_RATE, Math.abs(event.cashMultiplier))
      let delta = Math.floor((this.player.cash / 100) * rate)
      if (delta <= 0) {
        delta = Math.max(BuildingManager.MIN_MONEY_DELTA, Math.abs(event.cashMultiplier))
      }
      return event.cashMultiplier > 0 ? -delta : delta
    }
    
    // 没有 cashMultiplier 时，给一个固定小金额波动
    const sign = Math.random() < 0.5 ? -1 : 1
    return sign * Math.max(BuildingManager.MIN_MONEY_DELTA, Math.floor(Math.random() * BuildingManager.MAX_MONEY_DELTA))
  }
}

