import type { Goods, GameState } from '@/types/game'

/**
 * 商品查找服务
 * 提供统一的商品查找功能
 */
export class GoodsFinder {
  constructor(private state: GameState) {}

  /**
   * 根据商品ID查找商品
   */
  findById(goodsId: number): Goods | undefined {
    return this.state.goods.find(g => g.id === goodsId)
  }

  /**
   * 根据商品ID查找商品索引
   */
  findIndexById(goodsId: number): number {
    return this.state.goods.findIndex(g => g.id === goodsId)
  }

  /**
   * 根据商品ID或索引查找商品
   * 兼容两种查找方式
   */
  findByIdOrIndex(goodsIdOrIndex: number): { goods: Goods; index: number } | null {
    let goods: Goods | undefined
    let goodsIndex: number
    
    if (goodsIdOrIndex >= 0 && goodsIdOrIndex < this.state.goods.length) {
      goods = this.state.goods[goodsIdOrIndex]
      goodsIndex = goodsIdOrIndex
      
      if (goods && goods.id !== goodsIdOrIndex) {
        const goodsById = this.findById(goodsIdOrIndex)
        if (goodsById) {
          goods = goodsById
          goodsIndex = this.findIndexById(goodsIdOrIndex)
        }
      }
    } else {
      goodsIndex = this.findIndexById(goodsIdOrIndex)
      if (goodsIndex !== -1) {
        goods = this.state.goods[goodsIndex]
      }
    }
    
    if (!goods || goodsIndex === -1) {
      return null
    }

    return { goods, index: goodsIndex }
  }

  /**
   * 获取所有商品
   */
  getAll(): Goods[] {
    return this.state.goods
  }

  /**
   * 获取已拥有的商品
   */
  getOwned(): Goods[] {
    return this.state.goods.filter(g => (g.owned || 0) > 0)
  }
}
