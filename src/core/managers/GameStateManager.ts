import type { GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import { getCity } from '@/config/theme.config'
import { GoodsLibraryManager } from './GoodsLibraryManager'

export class GameStateManager {
  private goodsLibrary: GoodsLibraryManager

  constructor(private config: GameConfig) {
    this.goodsLibrary = new GoodsLibraryManager()
  }

  createInitialState(cityKey?: string): GameState {
    const cityKeyLower = (cityKey || 'shanghai').toLowerCase()
    const currentCity = getCity(cityKeyLower) || getCity('shanghai')
    if (!currentCity) {
      throw new Error('无法创建初始状态：找不到城市配置')
    }
    
    const cityGoods = currentCity.getGoods()
    // 使用统一商品库的所有商品，而不是只使用当前城市的商品
    const allGoodsFromLibrary = this.goodsLibrary.getAllGoods()
    
    // 创建商品数组，保留当前城市商品的价格范围，但包含所有商品
    const goods = allGoodsFromLibrary.map(libraryGoods => {
      // 查找当前城市是否定义了这个商品
      const cityGoodsDef = cityGoods.find(g => g.id === libraryGoods.id)
      if (cityGoodsDef) {
        // 如果当前城市有定义，使用当前城市的 basePrice 和 priceRange
        return {
          ...libraryGoods,
          basePrice: cityGoodsDef.basePrice,
          priceRange: cityGoodsDef.priceRange,
          price: 0,
          owned: 0
        }
      } else {
        // 如果当前城市没有定义，保留商品库中的定义
        return {
          ...libraryGoods,
          price: 0,
          owned: 0
        }
      }
    })
    
    return {
      cash: this.config.initial.cash,
      debt: this.config.initial.debt,
      bankSavings: 0,
      health: this.config.initial.health,
      stamina: this.config.initial.stamina,
      maxStamina: this.config.initial.stamina,
      fame: this.config.initial.fame,
      timeLeft: this.config.time.totalWeeks,
      currentLocation: -1,
      goods,
      totalGoods: 0,
      maxCapacity: this.config.initial.capacity,
      baseCapacity: this.config.initial.capacity,
      rentedCities: [],
      rentedHouses: {},
      rentMultipliers: {},
      workVisits: {},
      currentCity: currentCity.getCityName(),
      cityVisitsThisWeek: [],
      soundEnabled: true,
      isGameOver: false,
      gameResult: null,
      predictionMarket: {
        activeEvents: [],
        settledEvents: [],
        bets: [],
        totalBetsAmount: 0,
        totalPayout: 0,
        statistics: {
          totalPredictions: 0,
          successfulPredictions: 0,
          failedPredictions: 0,
          winRate: 0,
          netProfit: 0
        }
      }
    }
  }

  reset(state: GameState): void {
    const initialState = this.createInitialState()
    Object.assign(state, initialState)
  }

  /**
   * 更新商品库以适应新城市
   * 保留所有已拥有的商品
   */
  updateGoodsForCity(state: GameState, cityKey: string): void {
    state.goods = this.goodsLibrary.updateGoodsForCity(state.goods, cityKey)
    // 重新计算总商品数
    state.totalGoods = state.goods.reduce((sum, g) => sum + (g.owned || 0), 0)
  }
}
