import type { GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import type { IMessageHandler, ISoundPlayer } from './interfaces/IMessageHandler'
import { PriceGenerator } from './generators/PriceGenerator'
import { FinancialManager } from './managers/FinancialManager'
import { BuildingManager } from './managers/BuildingManager'
import { MarketManager } from './managers/MarketManager'
import { CityManager } from './managers/CityManager'
import { City } from './models/City'
import { CommercialEventHandler } from './handlers/CommercialEventHandler'
import { HealthEventHandler } from './handlers/HealthEventHandler'
import { MoneyEventHandler } from './handlers/MoneyEventHandler'
import type { RandomEvent, HealthEvent, MoneyEvent } from '@/types/game'
import type { SCORE_EVALUATIONS } from '@/utils/gameData'
import type { ThemeConfig } from '@/config/theme.config'
import { availableCities, shanghaiTheme } from '@/config/theme.config'

export class GameEngine {
  private priceGenerator: PriceGenerator
  private financialManager: FinancialManager
  private buildingManager: BuildingManager
  private marketManager: MarketManager
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
    
    const cityInfo = availableCities.find(c => c.name === this.state.currentCity)
    const currentCity = cityInfo ? new City(
      cityInfo.name,
      cityInfo.shortName,
      cityInfo.theme,
      [...this.state.cityVisitsThisWeek]
    ) : null
    
    this.priceGenerator = new PriceGenerator(config, currentCity)
    
    this.cityManager = new CityManager(
      state,
      config,
      messageHandler,
      (cityName: string, theme: ThemeConfig) => {
        this.updateEventHandlers(theme)
        const cityInfo = availableCities.find(c => c.name === cityName)
        if (cityInfo) {
          const city = new City(
            cityInfo.name,
            cityInfo.shortName,
            cityInfo.theme,
            [...this.state.cityVisitsThisWeek]
          )
          this.priceGenerator.setCity(city)
          this.buildingManager.updateBuildingsForCity(cityName)
        }
      }
    )
    
    this.financialManager = new FinancialManager(state, config, messageHandler)
    this.buildingManager = new BuildingManager(state, config, messageHandler)
    this.marketManager = new MarketManager(state, config)
    this.commercialHandler = new CommercialEventHandler(
      state, config, commercialEvents, messageHandler
    )
    this.healthHandler = new HealthEventHandler(
      state, config, healthEvents, messageHandler, soundPlayer
    )
    this.moneyHandler = new MoneyEventHandler(
      state, config, moneyEvents, messageHandler
    )
  }

  updateEventHandlers(newTheme: ThemeConfig): void {
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

  private getCurrentCityTheme(): ThemeConfig {
    const cityInfo = availableCities.find(c => c.name === this.state.currentCity)
    return cityInfo?.theme || availableCities[0]?.theme || shanghaiTheme
  }

  nextTime(): void {
    const currentTheme = this.getCurrentCityTheme()
    if (currentTheme.events.commercial !== this.commercialEvents ||
        currentTheme.events.health !== this.healthEvents ||
        currentTheme.events.money !== this.moneyEvents) {
      this.updateEventHandlers(currentTheme)
    }

    // 更新 PriceGenerator 的城市信息
    const cityInfo = availableCities.find(c => c.name === this.state.currentCity)
    if (cityInfo) {
      const currentCity = new City(
        cityInfo.name,
        cityInfo.shortName,
        cityInfo.theme,
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
    
    this.commercialHandler.process()
    this.healthHandler.process()
    this.moneyHandler.process()

    this.financialManager.checkDebtLimit()
    this.financialManager.checkBankHacking(this.config.financial.hackerEnabled)

    const wasHospitalized = this.buildingManager.checkForcedHospitalization()
    
    if (!wasHospitalized) {
      this.state.timeLeft--
    }

    if (this.state.timeLeft <= 0 || this.state.health <= 0) {
      if (this.state.health <= 0) {
        this.messageHandler.show("你倒在街头，你的日记本上写着：\"我太累了，需要休息...\"")
      }
      this.endGame()
      return
    }

    if (this.state.timeLeft === 1) {
      this.messageHandler.show(`最后${this.config.time.unit}了，记得把所有商品都卖掉！`)
    }
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
    const cityInfo = availableCities.find(c => c.name === this.state.currentCity)
    if (cityInfo) {
      const currentCity = new City(
        cityInfo.name,
        cityInfo.shortName,
        cityInfo.theme,
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

