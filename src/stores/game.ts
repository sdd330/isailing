import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState } from '@/types/game'
import type { IMessageHandler, ISoundPlayer } from '@/core/interfaces/IMessageHandler'
import { SCORE_EVALUATIONS } from '@/utils/gameData'
import type { ThemeConfig } from '@/config/theme.config'
import { availableCities, shanghaiTheme } from '@/config/theme.config'
import { gameConfig } from '@/config/game.config'
import { GameStateManager } from '@/core/managers/GameStateManager'
import { GoodsManager } from '@/core/managers/GoodsManager'
import { GameEngine } from '@/core/GameEngine'
import { CityManager } from '@/core/managers/CityManager'
import { FinancialManager } from '@/core/managers/FinancialManager'
import { BuildingManager } from '@/core/managers/BuildingManager'
import { MarketManager } from '@/core/managers/MarketManager'

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
  let cityManager: CityManager | null = null

  // ==================== 初始化方法 ====================
  const getCurrentCityTheme = (): ThemeConfig => {
    const cityInfo = availableCities.find(c => c.name === gameState.value.currentCity)
    return cityInfo?.theme || availableCities[1]?.theme || shanghaiTheme
  }

  const initializeEngine = (theme?: ThemeConfig) => {
    const currentTheme = theme || getCurrentCityTheme()
    
    if (!gameEngine) {
      gameEngine = new GameEngine(
        gameState.value,
        gameConfig,
        currentTheme.events.commercial,
        currentTheme.events.health,
        currentTheme.events.money,
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
    
    if (!cityManager) {
      cityManager = new CityManager(
        gameState.value,
        gameConfig,
        messageHandler,
        (cityName: string, theme: ThemeConfig) => {
          reinitializeEngine(theme)
        }
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

  const reinitializeEngine = (theme: ThemeConfig) => {
    if (gameEngine) {
      gameEngine.updateEventHandlers(theme)
    } else {
      initializeEngine(theme)
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
    return gameState.value.totalGoods < gameState.value.maxCapacity
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

  const visitDelivery = (): boolean => {
    ensureManagersInitialized()
    return buildingManager!.visitDelivery()
  }

  const visitConstructionSite = (): boolean => {
    ensureManagersInitialized()
    return buildingManager!.visitConstructionSite()
  }

  const expandHouse = (): boolean => {
    ensureManagersInitialized()
    return buildingManager!.expandHouse()
  }

  // ==================== 城市操作 ====================
  const switchCity = (cityName: string, transportationType: 'train' | 'plane' = 'train'): boolean => {
    ensureManagersInitialized()
    return cityManager!.switchCity(cityName, transportationType)
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
    if (!gameEngine || !goodsManager || !financialManager || !buildingManager || !marketManager || !cityManager) {
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
    visitDelivery,
    visitConstructionSite,
    expandHouse,
    
    // 城市操作
    switchCity,
    
    // 引擎管理
    reinitializeEngine,
    
    // 接口设置
    setMessageHandler,
    setSoundPlayer
  }
})
