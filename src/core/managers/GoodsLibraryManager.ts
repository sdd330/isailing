import type { Goods } from '@/types/game'
import type { ThemeConfig } from '@/config/theme.config'
import { availableCities } from '@/config/theme.config'
import { debugLog, debugError } from '../../utils/debug'

/**
 * 统一商品库管理器
 * 管理所有城市的商品，确保商品不受城市切换影响
 */
export class GoodsLibraryManager {
  private allGoodsMap: Map<number, Goods> = new Map()

  constructor() {
    this.initializeGoodsLibrary()
  }

  /**
   * 初始化统一商品库
   * 收集所有城市的商品定义和所有事件中使用的商品ID，合并成一个统一的商品库
   * 使用全局唯一的商品ID（城市ID * 10 + 商品index）
   */
  private initializeGoodsLibrary(): void {
    const goodsMap = new Map<number, Goods>()
    const eventGoodsIds = new Set<number>()

    // 第一步：收集所有事件中使用的商品ID
    availableCities.forEach(city => {
      // 收集商业事件中的商品ID
      city.theme.events.commercial?.forEach(event => {
        if (event.goodsId !== undefined) {
          eventGoodsIds.add(event.goodsId)
        }
      })
    })

    debugLog(`[GoodsLibrary] 收集到 ${eventGoodsIds.size} 个事件商品ID: [${Array.from(eventGoodsIds).sort((a, b) => a - b).join(', ')}]`)

    // 第二步：遍历所有城市，收集所有商品定义
    // 商品ID是全局唯一的（城市ID * 10 + 商品index），所以直接收集即可
    availableCities.forEach(city => {
      city.theme.goods.forEach((goodsDef) => {
        // 验证商品ID是否正确（用于调试）
        // 商品ID应该是：城市ID * 10 + index
        // 但为了灵活性，我们直接使用配置中的ID，并验证其唯一性
        
        // 商品ID现在是全局唯一的，直接添加
        if (!goodsMap.has(goodsDef.id)) {
          goodsMap.set(goodsDef.id, {
            ...goodsDef,
            price: 0,
            owned: 0
          })
          debugLog(`[GoodsLibrary] 添加商品: ${goodsDef.name}(id=${goodsDef.id}) from ${city.theme.city.name}`)
        } else {
          // 如果商品ID已存在，更新基础价格和价格范围（保留 owned 和 price）
          const existingGoods = goodsMap.get(goodsDef.id)!
          goodsMap.set(goodsDef.id, {
            ...existingGoods,
            basePrice: goodsDef.basePrice,
            priceRange: goodsDef.priceRange
          })
          debugLog(`[GoodsLibrary] 更新商品定义: ${goodsDef.name}(id=${goodsDef.id}) from ${city.theme.city.name}`)
        }
      })
    })
    
    debugLog(`[GoodsLibrary] 商品ID验证完成，共 ${goodsMap.size} 个唯一商品ID: [${Array.from(goodsMap.keys()).sort((a, b) => a - b).join(', ')}]`)

    // 第三步：确保所有事件中使用的商品ID都有对应的商品定义
    // 如果某个事件使用的商品ID在所有城市都没有定义，记录错误
    const missingGoodsIds: number[] = []
    eventGoodsIds.forEach(goodsId => {
      if (!goodsMap.has(goodsId)) {
        missingGoodsIds.push(goodsId)
        // 查找第一个定义了这个商品ID的城市
        for (const city of availableCities) {
          const goodsDef = city.theme.goods.find(g => g.id === goodsId)
          if (goodsDef) {
            goodsMap.set(goodsId, {
              ...goodsDef,
              price: 0,
              owned: 0
            })
            debugLog(`[GoodsLibrary] 从事件中发现缺失商品: ${goodsDef.name}(id=${goodsId})，使用 ${city.theme.city.name} 的定义`)
            break
          }
        }
        
        // 如果仍然找不到，记录错误
        if (!goodsMap.has(goodsId)) {
          debugError(`[GoodsLibrary] 错误：事件中使用的商品ID ${goodsId} 在所有城市都没有定义！`)
        }
      }
    })

    if (missingGoodsIds.length > 0) {
      debugError(`[GoodsLibrary] 警告：${missingGoodsIds.length} 个事件商品ID未找到定义: [${missingGoodsIds.join(', ')}]`)
    }

    // 验证：确保所有商品ID都是全局唯一的
    const allGoodsIds = Array.from(goodsMap.keys())
    const duplicateIds = allGoodsIds.filter((id, index) => allGoodsIds.indexOf(id) !== index)
    if (duplicateIds.length > 0) {
      debugError(`[GoodsLibrary] 错误：发现重复的商品ID: [${duplicateIds.join(', ')}]`)
    }

    this.allGoodsMap = goodsMap
    debugLog(`[GoodsLibrary] 初始化商品库完成，共 ${goodsMap.size} 种商品，事件涉及 ${eventGoodsIds.size} 种商品`)
  }

  /**
   * 获取统一商品库（所有商品的数组）
   */
  getAllGoods(): Goods[] {
    return Array.from(this.allGoodsMap.values())
  }

  /**
   * 根据当前城市主题更新商品库
   * 直接修改现有商品数组，而不是创建新数组，以保持 Vue 响应式
   * 只更新当前城市定义的商品的 basePrice 和 priceRange
   * 保留 owned 和 price
   */
  updateGoodsForCity(currentGoods: Goods[], theme: ThemeConfig): Goods[] {
    // 创建商品ID到当前商品的映射，保留 owned 和 price
    const currentGoodsMap = new Map<number, Goods>()
    currentGoods.forEach(g => {
      currentGoodsMap.set(g.id, { ...g })
    })

    // 记录更新前的总商品数
    const totalOwnedBefore = currentGoods.reduce((sum, g) => sum + (g.owned || 0), 0)

    // 创建新商品数组（因为需要重新排序和添加新商品）
    const updatedGoods: Goods[] = []

    // 首先添加当前城市定义的商品，保留 owned 和 price
    theme.goods.forEach(goodsDef => {
      const existingGoods = currentGoodsMap.get(goodsDef.id)
      const owned = existingGoods?.owned ?? 0
      const price = existingGoods?.price ?? 0
      
      updatedGoods.push({
        ...goodsDef,
        price,
        owned  // 确保保留 owned 值，即使为0也要保留
      })
      
      debugLog(`[GoodsLibrary] 更新商品: ${goodsDef.name}(id=${goodsDef.id}), owned=${owned}, price=${price}`)
    })

    // 然后添加玩家已拥有但当前城市没有定义的商品
    const cityGoodsIds = new Set(theme.goods.map(g => g.id))
    currentGoods.forEach(g => {
      if (g.owned > 0 && !cityGoodsIds.has(g.id)) {
        // 保留这个商品，即使当前城市没有定义它
        updatedGoods.push({
          ...g,
          price: 0 // 价格设为0，因为当前城市没有这个商品的市场
        })
        debugLog(`[GoodsLibrary] 保留跨城市商品: ${g.name}(id=${g.id}), owned=${g.owned}`)
      }
    })

    // 验证：确保所有已拥有的商品都被保留
    const totalOwnedAfter = updatedGoods.reduce((sum, g) => sum + (g.owned || 0), 0)
    
    if (totalOwnedBefore !== totalOwnedAfter) {
      debugLog(`[GoodsLibrary] 警告：商品数量不匹配！更新前: ${totalOwnedBefore}, 更新后: ${totalOwnedAfter}`)
      debugLog(`[GoodsLibrary] 更新前的商品:`, currentGoods.map(g => `${g.name}(id=${g.id}, owned=${g.owned})`))
      debugLog(`[GoodsLibrary] 更新后的商品:`, updatedGoods.map(g => `${g.name}(id=${g.id}, owned=${g.owned})`))
    }

    debugLog(`[GoodsLibrary] 更新商品库: 当前城市 ${theme.city.name}, 商品总数 ${updatedGoods.length}, 已拥有商品 ${updatedGoods.filter(g => g.owned > 0).length}`)

    return updatedGoods
  }

  /**
   * 创建初始商品库（基于指定城市主题）
   */
  createInitialGoods(theme: ThemeConfig): Goods[] {
    return theme.goods.map(g => ({
      ...g,
      price: 0,
      owned: 0
    }))
  }

  /**
   * 根据商品ID查找商品
   */
  findGoodsById(goodsId: number, goodsList: Goods[]): Goods | undefined {
    return goodsList.find(g => g.id === goodsId)
  }

  /**
   * 根据商品ID查找商品索引
   */
  findGoodsIndexById(goodsId: number, goodsList: Goods[]): number {
    return goodsList.findIndex(g => g.id === goodsId)
  }
}

