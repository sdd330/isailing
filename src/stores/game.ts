import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState } from '@/types/game'
import type { IMessageHandler, ISoundPlayer } from '@/core/interfaces/IMessageHandler'
import { SCORE_EVALUATIONS } from '@/utils/gameData'
import { getCity, getCityKeyByName } from '@/config/theme.config'
import { gameConfig } from '@/config/game.config'
import { GameStateManager } from '@/core/managers/GameStateManager'
import { GoodsManager } from '@/core/managers/GoodsManager'
import { GameEngine } from '@/core/GameEngine'
import { CityManager } from '@/core/managers/CityManager'
import { FinancialManager } from '@/core/managers/FinancialManager'
import { BuildingManager } from '@/core/managers/BuildingManager'
import { MarketManager } from '@/core/managers/MarketManager'
import { PredictionMarketManager } from '@/core/managers/PredictionMarketManager'

/**
 * 游戏 Store
 * 使用面向对象设计，管理游戏状态和所有 Managers
 */
export const useGameStore = defineStore('game', () => {
  // ==================== 状态管理 ====================
  const stateManager = new GameStateManager(gameConfig)
  const gameState = ref<GameState>(stateManager.createInitialState())

  // ==================== 接口实现 ====================
  const messageHandler: IMessageHandler = {
    show: (message: string) => {
      void message
      // 默认消息处理器，由组件层设置
    }
  }
  
  const soundPlayer: ISoundPlayer = {
    play: (soundFile: string) => {
      void soundFile
      if (gameState.value.soundEnabled) {
        // 声音播放逻辑，由组件层实现
      }
    }
  }

  // ==================== 核心引擎和 Managers ====================
  let gameEngine: GameEngine | null = null
  let goodsManager: GoodsManager | null = null
  let financialManager: FinancialManager | null = null
  let buildingManager: BuildingManager | null = null
  let marketManager: MarketManager | null = null
  let predictionMarketManager: PredictionMarketManager | null = null
  let cityManager: CityManager | null = null

  // ==================== 初始化方法 ====================
  const initializeEngine = () => {
    const cityKey = getCityKeyByName(gameState.value.currentCity || '上海')
    const currentCity = getCity(cityKey) || getCity('shanghai')
    if (!currentCity) {
      throw new Error('无法初始化游戏引擎：找不到城市配置')
    }
    
    if (!gameEngine) {
      const commercialEvents = currentCity.getEventStrategy().getCommercialEvents()
      const healthEvents = currentCity.getEventStrategy().getHealthEvents()
      const moneyEvents = currentCity.getEventStrategy().getMoneyEvents()
      gameEngine = new GameEngine(
        gameState.value,
        gameConfig,
        commercialEvents,
        healthEvents,
        moneyEvents,
        SCORE_EVALUATIONS,
        messageHandler,
        soundPlayer
      )
    }

    // 初始化所有 Managers
    if (!goodsManager) {
      goodsManager = new GoodsManager(gameState.value, gameConfig, messageHandler)
    }
    
    if (!financialManager) {
      financialManager = new FinancialManager(gameState.value, gameConfig, messageHandler)
    }
    
    if (!buildingManager) {
      buildingManager = new BuildingManager(gameState.value, gameConfig, messageHandler)
    }
    
    if (!marketManager) {
      marketManager = new MarketManager(gameState.value, gameConfig)
    }

    if (!predictionMarketManager) {
      predictionMarketManager = new PredictionMarketManager(gameState.value)
    }

    if (!cityManager) {
      cityManager = new CityManager(
        gameState.value,
        gameConfig,
        messageHandler
      )
    }
    
    // 生成初始商品价格（如果还没有生成）
    generateInitialPrices()
  }
  
  const generateInitialPrices = () => {
    if (!gameEngine) return
    
    // 检查是否所有商品价格都是0（表示还没有生成价格）
    const allPricesZero = gameState.value.goods.every(g => g.price === 0)
    if (allPricesZero) {
      // 通过 GameEngine 的方法生成初始价格
      gameEngine.generateInitialPrices()
    }
  }

  const reinitializeEngine = (_theme?: unknown) => {
    void _theme
    // 目前 GameEngine 会在每次 nextTime 时根据当前城市自动刷新事件配置
    // 这里仅在引擎未初始化时触发初始化，避免运行时错误
    if (!gameEngine) {
      initializeEngine()
    }
  }

  const initializeGame = () => {
    stateManager.reset(gameState.value)
    // 重置所有 Managers
    gameEngine = null
    goodsManager = null
    financialManager = null
    buildingManager = null
    marketManager = null
    predictionMarketManager = null
    cityManager = null
    initializeEngine()
  }

  // ==================== 计算属性 ====================
  const finalScore = computed(() => {
    return gameState.value.cash + gameState.value.bankSavings - gameState.value.debt
  })

  const weeksPlayed = computed(() => {
    return gameConfig.time.totalWeeks - gameState.value.timeLeft
  })

  const canAffordGoods = computed(() => {
    return (price: number) => gameState.value.cash >= price
  })

  const hasSpaceForGoods = computed(() => {
    const rentedCities = gameState.value.rentedCities || []
    const base = gameState.value.baseCapacity ?? gameConfig.initial.capacity
    const effectiveMax = rentedCities.includes(gameState.value.currentCity)
      ? gameState.value.maxCapacity
      : base
    return gameState.value.totalGoods < effectiveMax
  })

  // ==================== 商品操作 ====================
  const buyGoods = (goodsId: number, quantity: number = 1): boolean => {
    ensureManagersInitialized()
    return goodsManager!.buy(goodsId, quantity)
  }

  const sellGoods = (goodsId: number, quantity: number = 1): boolean => {
    ensureManagersInitialized()
    return goodsManager!.sell(goodsId, quantity)
  }

  // ==================== 金融操作 ====================
  const bankDeposit = (amount: number): boolean => {
    ensureManagersInitialized()
    return financialManager!.deposit(amount)
  }

  const bankWithdraw = (amount: number): boolean => {
    ensureManagersInitialized()
    return financialManager!.withdraw(amount)
  }

  const repayDebt = (amount: number): boolean => {
    ensureManagersInitialized()
    return financialManager!.repayDebt(amount)
  }

  // ==================== 建筑操作 ====================
  const hospitalTreatment = (points: number): boolean => {
    ensureManagersInitialized()
    return buildingManager!.hospitalTreatment(points)
  }

  const doWork = (workTypeId: string = 'construction'): boolean => {
    ensureManagersInitialized()
    return buildingManager!.doWork(workTypeId)
  }

  const eatAtRestaurant = (): boolean => {
    ensureManagersInitialized()
    return buildingManager!.eatAtRestaurant()
  }

  const rentHouse = (houseTypeId: string): boolean => {
    ensureManagersInitialized()
    return buildingManager!.rentHouse(houseTypeId)
  }

  const takeSubway = (target: 'train' | 'airport'): boolean => {
    ensureManagersInitialized()
    return buildingManager!.takeSubway(target)
  }

  // ==================== 城市操作 ====================
  const switchCity = (
    cityName: string,
    transportationType: 'train' | 'plane' = 'train',
    options?: { skipCost?: boolean }
  ): boolean => {
    ensureManagersInitialized()
    return cityManager!.switchCity(cityName, transportationType, options)
  }

  // ==================== 游戏流程 ====================
  const nextTime = () => {
    ensureManagersInitialized()
    gameEngine!.nextTime()
    cityManager!.resetWeeklyVisits()
  }

  const endGame = () => {
    ensureManagersInitialized()
    gameEngine!.endGame()
  }

  // ==================== 辅助方法 ====================
  const ensureManagersInitialized = () => {
    if (!gameEngine || !goodsManager || !financialManager || !buildingManager || !marketManager || !predictionMarketManager || !cityManager) {
      initializeEngine()
    }
  }

  const setMessageHandler = (handler: (message: string) => void) => {
    messageHandler.show = handler
  }

  const setSoundPlayer = (player: ISoundPlayer) => {
    Object.assign(soundPlayer, player)
  }

  // ==================== 初始化 ====================
  initializeEngine()

  // ==================== 返回 Store API ====================
  return {
    // 状态
    gameState,
    
    // 计算属性
    finalScore,
    timePlayed: weeksPlayed,
    canAffordGoods,
    hasSpaceForGoods,
    
    // Managers (只读访问)
    get goodsManager() {
      ensureManagersInitialized()
      return goodsManager!
    },
    get financialManager() {
      ensureManagersInitialized()
      return financialManager!
    },
    get buildingManager() {
      ensureManagersInitialized()
      return buildingManager!
    },
    get marketManager() {
      ensureManagersInitialized()
      return marketManager!
    },
    get cityManager() {
      ensureManagersInitialized()
      return cityManager!
    },
    get predictionMarketManager() {
      ensureManagersInitialized()
      return predictionMarketManager!
    },
    get gameEngine() {
      ensureManagersInitialized()
      return gameEngine!
    },
    
    // 游戏操作
    initializeGame,
    nextTime,
    nextDay: nextTime,
    endGame,
    
    // 商品操作
    buyGoods,
    sellGoods,
    
    // 金融操作
    bankDeposit,
    bankWithdraw,
    repayDebt,
    postOfficePayment: repayDebt,
    
    // 建筑操作
    hospitalTreatment,
    doWork,
    eatAtRestaurant,
    rentHouse,
    takeSubway,
    
    // 城市操作
    switchCity,
    
    // 引擎管理
    reinitializeEngine,
    
    // 接口设置
    setMessageHandler,
    setSoundPlayer
  }
})
