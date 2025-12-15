import type { Goods as GoodsData, GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import { MarketFormatter } from '../formatters/MarketFormatter'
import { Market } from '../models/Market'
import { Goods } from '../models/Goods'
import { Player } from '../models/Player'

export interface MarketGoodsInfo {
  goods: GoodsData
  canAfford: boolean
  hasSpace: boolean
  canBuy: boolean
  status: 'available' | 'insufficient_funds' | 'insufficient_space'
}

export interface MarketInfo {
  availableGoods: MarketGoodsInfo[]
  totalAvailable: number
  purchasableCount: number
  isEmpty: boolean
}

export class MarketManager {
  private formatter: MarketFormatter
  private market: Market | null = null
  private player: Player

  constructor(
    private state: GameState,
    private config: GameConfig
  ) {
    this.formatter = new MarketFormatter()
    this.player = new Player(state)
  }

  /**
   * 创建或更新黑市
   * @param cityName 城市名称
   * @param cityGoodsIds 当前城市可用的商品ID集合（用于过滤）
   */
  createMarket(cityName: string, cityGoodsIds: Set<number>): Market {
    const market = new Market(cityName)
    
    this.state.goods.forEach(goodsData => {
      if (cityGoodsIds.has(goodsData.id) && goodsData.price > 0) {
        const goods = Goods.fromData(goodsData)
        const canAfford = this.player.canAfford(goods.price)
        const hasSpace = this.player.hasSpace(1)
        const canBuy = goods.canBuy(this.player.cash, this.player.getAvailableSpace())
        
        let status: MarketGoodsInfo['status'] = 'available'
        if (!canAfford) {
          status = 'insufficient_funds'
        } else if (!hasSpace) {
          status = 'insufficient_space'
        }

        market.addGoods({
          goods: goodsData,
          canAfford,
          hasSpace,
          canBuy,
          status
        })
      }
    })

    market.sortByPrice(true)
    this.market = market
    return market
  }

  /**
   * 获取当前城市的黑市商品列表
   * 每次调用都重新创建黑市，确保价格是最新的
   */
  getMarketGoods(cityName: string, cityGoodsIds: Set<number>): GoodsData[] {
    // 每次都重新创建黑市，确保价格是最新的
    // 因为随机事件可能已经更新了商品价格
    this.createMarket(cityName, cityGoodsIds)
    return this.market!.getAvailableGoods().map(mg => mg.goods)
  }

  /**
   * 检查商品是否可以购买
   */
  canBuyGoods(goodsData: GoodsData): { canAfford: boolean; hasSpace: boolean; canBuy: boolean } {
    const goods = Goods.fromData(goodsData)
    const canAfford = this.player.canAfford(goods.price)
    const hasSpace = this.player.hasSpace(1)
    const canBuy = goods.canBuy(this.player.cash, this.player.getAvailableSpace())

    return { canAfford, hasSpace, canBuy }
  }

  /**
   * 获取黑市信息
   * 每次调用都重新创建黑市，确保价格是最新的（因为事件可能已经更新了价格）
   */
  getMarketInfo(cityName: string, cityGoodsIds: Set<number>): MarketInfo {
    // 每次都重新创建黑市，确保价格是最新的
    // 因为随机事件可能已经更新了商品价格
    this.createMarket(cityName, cityGoodsIds)

    const marketGoods = this.market!.getAvailableGoods()
    const marketGoodsInfo: MarketGoodsInfo[] = marketGoods.map(mg => ({
      goods: mg.goods,
      canAfford: mg.canAfford,
      hasSpace: mg.hasSpace,
      canBuy: mg.canBuy,
      status: mg.status
    }))

    return {
      availableGoods: marketGoodsInfo,
      totalAvailable: marketGoodsInfo.length,
      purchasableCount: this.market!.getPurchasableCount(),
      isEmpty: this.market!.isEmpty()
    }
  }

  /**
   * 获取商品状态图标
   */
  getStatusIcon(status: MarketGoodsInfo['status']): string {
    return this.formatter.getStatusIcon(status)
  }

  /**
   * 获取商品状态文本
   */
  getStatusText(status: MarketGoodsInfo['status']): string {
    return this.formatter.getStatusText(status)
  }

  /**
   * 格式化黑市显示文本
   */
  formatMarketText(marketInfo: MarketInfo): string {
    return this.formatter.formatMarketText(marketInfo)
  }

  /**
   * 获取最大可购买数量
   */
  getMaxPurchaseQuantity(goodsData: GoodsData): number {
    const goods = Goods.fromData(goodsData)
    const maxByCash = Math.floor(this.player.cash / goods.price)
    const maxByCapacity = this.player.getAvailableSpace()
    return Math.min(maxByCash, maxByCapacity)
  }

  /**
   * 获取黑市对象
   */
  getMarket(): Market | null {
    return this.market
  }
}
