import type { GameState, PredictionMarketEvent } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import type { IMessageHandler, ISoundPlayer } from './interfaces/IMessageHandler'
import { PriceGenerator } from './generators/PriceGenerator'
import { FinancialManager } from './managers/FinancialManager'
import { BuildingManager } from './managers/BuildingManager'
import { MarketManager } from './managers/MarketManager'
import { PredictionMarketManager } from './managers/PredictionMarketManager'
import { generateAvailableEvents } from '@/config/predictionMarket.config'
import { CityManager } from './managers/CityManager'
import { City } from './models/City'
import { CommercialEventHandler } from './handlers/CommercialEventHandler'
import { HealthEventHandler } from './handlers/HealthEventHandler'
import { MoneyEventHandler } from './handlers/MoneyEventHandler'
import type { RandomEvent, HealthEvent, MoneyEvent } from '@/types/game'
import type { SCORE_EVALUATIONS } from '@/utils/gameData'
import { configManager, getCity, getCityKeyByName } from '@/config/theme.config'
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

interface GameCityTheme extends CityThemeForCallback {
  events: {
    commercial: RandomEvent[]
    health: HealthEvent[]
    money: MoneyEvent[]
  }
}

export class GameEngine {
  private priceGenerator: PriceGenerator
  private financialManager: FinancialManager
  private buildingManager: BuildingManager
  private marketManager: MarketManager
  private predictionMarketManager: PredictionMarketManager
  private cityManager: CityManager
  private commercialHandler: CommercialEventHandler
  private healthHandler: HealthEventHandler
  private moneyHandler: MoneyEventHandler
  private commercialEvents: RandomEvent[]
  private healthEvents: HealthEvent[]
  private moneyEvents: MoneyEvent[]

  constructor(
    private state: GameState,
    private config: GameConfig,
    commercialEvents: RandomEvent[],
    healthEvents: HealthEvent[],
    moneyEvents: MoneyEvent[],
    private scoreEvaluations: typeof SCORE_EVALUATIONS,
    private messageHandler: IMessageHandler,
    private soundPlayer: ISoundPlayer
  ) {
    this.commercialEvents = commercialEvents
    this.healthEvents = healthEvents
    this.moneyEvents = moneyEvents
    
    const cityList = configManager.getCityList()
    const cityInfo = cityList.find(c => c.name === this.state.currentCity)
    const currentCity = cityInfo ? new City(
      cityInfo.name,
      cityInfo.shortName,
      [...this.state.cityVisitsThisWeek]
    ) : null
    
    this.priceGenerator = new PriceGenerator(config, currentCity)
    
    this.cityManager = new CityManager(
      state,
      config,
      messageHandler,
      (cityName: string, theme: CityThemeForCallback) => {
        // 从当前城市获取事件并更新处理器
        const currentCity = getCity(cityName.toLowerCase())
        if (currentCity) {
          const fullTheme: GameCityTheme = {
            ...theme,
            events: {
              commercial: currentCity.getEventStrategy().getCommercialEvents(),
              health: currentCity.getEventStrategy().getHealthEvents(),
              money: currentCity.getEventStrategy().getMoneyEvents()
            }
          }
          this.updateEventHandlers(fullTheme)
        }
        const cityList = configManager.getCityList()
        const cityInfo = cityList.find(c => c.name === cityName)
        if (cityInfo) {
          const city = new City(
            cityInfo.name,
            cityInfo.shortName,
            [...this.state.cityVisitsThisWeek]
          )
          this.priceGenerator.setCity(city)
          this.buildingManager.updateBuildingsForCity(cityName)
          // 加载并恢复新城市的租房信息
          this.buildingManager.loadRentInfoForCity(cityName)
        }
      }
    )
    
    this.financialManager = new FinancialManager(state, config, messageHandler, () => this.checkHealthGameOver())
    this.buildingManager = new BuildingManager(state, config, messageHandler)
    this.marketManager = new MarketManager(state, config)
    this.predictionMarketManager = new PredictionMarketManager(state)
    this.commercialHandler = new CommercialEventHandler(
      state, config, commercialEvents, messageHandler
    )
    this.healthHandler = new HealthEventHandler(
      state, config, healthEvents, messageHandler, soundPlayer, () => this.checkHealthGameOver()
    )
    this.moneyHandler = new MoneyEventHandler(
      state, config, moneyEvents, messageHandler
    )
  }

  updateEventHandlers(newTheme: GameCityTheme): void {
    this.commercialEvents = newTheme.events.commercial
    this.healthEvents = newTheme.events.health
    this.moneyEvents = newTheme.events.money
    this.commercialHandler = new CommercialEventHandler(
      this.state, this.config, this.commercialEvents, this.messageHandler
    )
    this.healthHandler = new HealthEventHandler(
      this.state, this.config, this.healthEvents, this.messageHandler, this.soundPlayer
    )
    this.moneyHandler = new MoneyEventHandler(
      this.state, this.config, this.moneyEvents, this.messageHandler
    )
  }

  private getCurrentCityTheme(): GameCityTheme | null {
    const cityKey = getCityKeyByName(this.state.currentCity || '上海')
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
        events: {
          commercial: currentCity.getEventStrategy().getCommercialEvents(),
          health: currentCity.getEventStrategy().getHealthEvents(),
          money: currentCity.getEventStrategy().getMoneyEvents()
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
      events: {
        commercial: shanghaiCity.getEventStrategy().getCommercialEvents(),
        health: shanghaiCity.getEventStrategy().getHealthEvents(),
        money: shanghaiCity.getEventStrategy().getMoneyEvents()
      }
    } : null
  }

  nextTime(): void {
    const currentTheme = this.getCurrentCityTheme()
    if (currentTheme &&
        (currentTheme.events.commercial !== this.commercialEvents ||
         currentTheme.events.health !== this.healthEvents ||
         currentTheme.events.money !== this.moneyEvents)) {
      this.updateEventHandlers(currentTheme)
    }

    // 更新 PriceGenerator 的城市信息
    const cityList = configManager.getCityList()
    const cityInfo = cityList.find(c => c.name === this.state.currentCity)
    if (cityInfo) {
      const currentCity = new City(
        cityInfo.name,
        cityInfo.shortName,
        [...this.state.cityVisitsThisWeek]
      )
      this.priceGenerator.setCity(currentCity)
    }

    const leaveOut = this.priceGenerator.getLeaveOut(
      this.state.currentLocation,
      this.state.timeLeft
    )
    this.priceGenerator.generate(this.state.goods, leaveOut)

    this.financialManager.processInterest()
    
    // 处理房租涨跌事件（每周有一定概率触发）
    this.buildingManager.processRentEvents()

    // 每月处理一次房租：GameConfig 以周为单位，简单按每 4 周视为 1 个月
    const weeksPlayed = this.config.time.totalWeeks - this.state.timeLeft
    if (weeksPlayed > 0 && weeksPlayed % 4 === 0) {
      this.buildingManager.processRent()
    }

    // 处理每周酒店费用和露宿街头
    this.processWeeklyAccommodation()

    // 处理预测市场事件：结算过期事件，生成新事件
    this.processPredictionMarket()

    // 在没有租房的城市做生意，带着行李满街跑，有一定概率丢失行李和所有随身货物
    const hasHouseHere = this.buildingManager.hasRentedHouseInCurrentCity()
    if (!hasHouseHere && this.state.totalGoods > 0) {
      // 丢行李概率：例如 8%
      const roll = Math.random() * 100
      if (roll < 8) {
        // 清空所有商品
        this.state.goods.forEach(g => {
          g.owned = 0
        })
        this.state.totalGoods = 0
        // 容量仍然是行李箱基础容量；叙事为重新买一个行李箱后才继续做生意
        this.messageHandler.show(
          `你在${this.state.currentCity}拖着行李跑黑市做生意，不小心在地铁口被人顺走了行李箱，里面的货全没了！\n` +
          `还好命保住了，只能重新去黑市想办法东山再起……`
        )
      }
    }
    
    this.commercialHandler.process()
    this.healthHandler.process()
    this.moneyHandler.process()

    this.financialManager.checkDebtLimit()
    this.financialManager.checkBankHacking(this.config.financial.hackerEnabled)

    const wasHospitalized = this.buildingManager.checkForcedHospitalization()
    
    if (!wasHospitalized) {
      this.state.timeLeft--
      // 重置每日工作访问次数
      this.state.workVisits = {}
    }

    // 检查游戏结束条件
    if (this.checkGameOver()) {
      return
    }

    if (this.state.timeLeft === 1) {
      this.messageHandler.show(`最后${this.config.time.unit}了，记得把所有商品都卖掉！`)
    }
  }

  /**
   * 检查游戏结束条件
   */
  private checkGameOver(): boolean {
    if (this.state.timeLeft <= 0 || this.state.health <= 0) {
      if (this.state.health <= 0) {
        this.messageHandler.show("你倒在街头，你的日记本上写着：\"我太累了，需要休息...\"")
      }
      this.endGame()
      return true
    }
    return false
  }

  /**
   * 检查健康值是否导致游戏结束（公共方法）
   */
  checkHealthGameOver(): boolean {
    return this.checkGameOver()
  }

  /**
   * 处理预测市场事件：结算过期事件，生成新事件
   */
  private processPredictionMarket(): void {
    const currentWeek = this.config.time.totalWeeks - this.state.timeLeft

    // 结算已到期的预测事件
    this.predictionMarketManager.checkAndSettleEvents(currentWeek, this.state, this.marketManager)

    // 生成新的预测事件（每周生成3-5个）
    const newEvents = this.generatePredictionEvents(currentWeek)

    // 添加新事件到预测市场
    newEvents.forEach(event => {
      this.predictionMarketManager.createEvent(event)
    })
  }

  /**
   * 生成新的预测市场事件
   */
  private generatePredictionEvents(currentWeek: number): Array<Omit<PredictionMarketEvent, 'status' | 'createdAt'>> {
    return generateAvailableEvents(currentWeek, {
      cash: this.state.cash,
      debt: this.state.debt,
      health: this.state.health,
      currentCity: this.state.currentCity,
      cityVisitsThisWeek: [] // 可以后续扩展
    })
  }

  /**
   * 处理每周住宿费用（酒店或露宿街头）
   */
  private processWeeklyAccommodation(): void {
    const currentCityName = this.state.currentCity
    const rentedCities = this.state.rentedCities || []
    const hasHouse = rentedCities.includes(currentCityName)

    // 如果已租房，不需要处理酒店费用
    if (hasHouse) {
      return
    }

    const cityKey = getCityKeyByName(currentCityName)
    const cityConfig = configManager.getCityConfig(cityKey)

    if (!cityConfig) {
      // 如果无法获取城市配置，默认每日300元
      this.processHomelessness(300)
      return
    }

    const dailyPrice = cityConfig.getRentStrategy().getHotelDailyPrice()
    const weeklyCost = dailyPrice * 7

    // 检查是否有足够现金支付酒店费用
    if (this.state.cash >= weeklyCost) {
      // 支付酒店费用
      this.state.cash -= weeklyCost
      this.messageHandler.show(
        `🏨 你在${currentCityName}住了一周酒店，花费${weeklyCost.toLocaleString()}元（每日${dailyPrice}元 × 7天）。` +
        `现金从${(this.state.cash + weeklyCost).toLocaleString()}元降至${this.state.cash.toLocaleString()}元。`
      )
    } else {
      // 没钱住酒店，露宿街头
      this.processHomelessness(dailyPrice)
    }
  }

  /**
   * 处理露宿街头（每天扣除15健康值）
   */
  private processHomelessness(dailyHotelPrice: number): void {
    const healthLoss = 15 // 每天扣除15健康值
    const oldHealth = this.state.health
    this.state.health = Math.max(0, this.state.health - healthLoss)

    this.messageHandler.show(
      `🌙 你在${this.state.currentCity}没有租房，又没钱住酒店（需要${(dailyHotelPrice * 7).toLocaleString()}元），只能露宿街头。` +
      `\n健康从${oldHealth}点降至${this.state.health}点（-${healthLoss}点）。` +
      `\n💡 建议：尽快去中介租房或赚够钱住酒店！`
    )
  }

  endGame(): void {
    this.state.isGameOver = true

    const score = this.state.cash + this.state.bankSavings - this.state.debt
    let evaluation = this.scoreEvaluations[this.scoreEvaluations.length - 1]?.message ?? ''

    for (const evalItem of this.scoreEvaluations) {
      if (score >= evalItem.min) {
        evaluation = evalItem.message
        break
      }
    }

    const timePlayed = this.config.time.totalWeeks - this.state.timeLeft

    this.state.gameResult = {
      finalScore: score,
      evaluation,
      timePlayed
    }
  }

  get financial(): FinancialManager {
    return this.financialManager
  }

  get building(): BuildingManager {
    return this.buildingManager
  }

  get market(): MarketManager {
    return this.marketManager
  }
  
  /**
   * 生成初始商品价格
   * 用于游戏开始时初始化价格
   */
  generateInitialPrices(): void {
    const cityList = configManager.getCityList()
    const cityInfo = cityList.find(c => c.name === this.state.currentCity)
    if (cityInfo) {
      const currentCity = new City(
        cityInfo.name,
        cityInfo.shortName,
        [...this.state.cityVisitsThisWeek]
      )
      this.priceGenerator.setCity(currentCity)
      
      const leaveOut = this.priceGenerator.getLeaveOut(
        this.state.currentLocation,
        this.state.timeLeft
      )
      this.priceGenerator.generate(this.state.goods, leaveOut)
    }
  }
}

