import type { GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import { shanghaiTheme } from '@/config/theme.config'
import type { ThemeConfig } from '@/config/theme.config'
import { GoodsLibraryManager } from './GoodsLibraryManager'

export class GameStateManager {
  private goodsLibrary: GoodsLibraryManager

  constructor(private config: GameConfig) {
    this.goodsLibrary = new GoodsLibraryManager()
  }

  createInitialState(theme?: ThemeConfig): GameState {
    const currentTheme = theme || shanghaiTheme
    // 使用统一商品库的所有商品，而不是只使用当前城市的商品
    const allGoodsFromLibrary = this.goodsLibrary.getAllGoods()
    
    // 创建商品数组，保留当前城市商品的价格范围，但包含所有商品
    const goods = allGoodsFromLibrary.map(libraryGoods => {
      // 查找当前城市是否定义了这个商品
      const cityGoodsDef = currentTheme.goods.find(g => g.id === libraryGoods.id)
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
      fame: this.config.initial.fame,
      timeLeft: this.config.time.totalWeeks,
      currentLocation: -1,
      goods,
      totalGoods: 0,
      maxCapacity: this.config.initial.capacity,
      deliveryVisits: 0,
      currentCity: currentTheme.city.name,
      cityVisitsThisWeek: [],
      soundEnabled: true,
      isGameOver: false,
      gameResult: null
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
  updateGoodsForCity(state: GameState, theme: ThemeConfig): void {
    state.goods = this.goodsLibrary.updateGoodsForCity(state.goods, theme)
    // 重新计算总商品数
    state.totalGoods = state.goods.reduce((sum, g) => sum + (g.owned || 0), 0)
  }
}
