import type { Goods as GoodsData, GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import type { IMessageHandler } from '../interfaces/IMessageHandler'
import { BaseManager } from '../base/BaseManager'
import { GoodsFinder } from '../services/GoodsFinder'
import { FameService } from '../services/FameService'
import { GoodsLibraryManager } from './GoodsLibraryManager'
import { Goods } from '../models/Goods'
import { Player } from '../models/Player'
import { debugLog, debugError } from '../../utils/debug'

/**
 * 商品管理器
 * 统一管理所有商品的操作，确保所有商品都被正确初始化和管理
 */
export class GoodsManager extends BaseManager {
  private goodsFinder: GoodsFinder
  private fameService: FameService
  private goodsLibrary: GoodsLibraryManager
  private player: Player
  private goods: Map<number, Goods> = new Map()

  constructor(
    state: GameState,
    config: GameConfig,
    messageHandler: IMessageHandler
  ) {
    super(state, config, messageHandler)
    this.goodsFinder = new GoodsFinder(state)
    this.fameService = new FameService(state, messageHandler)
    this.goodsLibrary = new GoodsLibraryManager()
    this.player = new Player(state)
    this.initializeAllGoods()
  }

  /**
   * 统一初始化所有商品
   * 从统一商品库获取所有商品，确保没有遗漏
   * 同时同步 state.goods 中的商品数据（owned 和 price）
   */
  private initializeAllGoods(): void {
    // 从统一商品库获取所有商品定义
    const allGoodsFromLibrary = this.goodsLibrary.getAllGoods()
    
    // 创建 state.goods 的映射，用于同步 owned 和 price
    const stateGoodsMap = new Map<number, GoodsData>()
    this.state.goods.forEach(g => {
      stateGoodsMap.set(g.id, g)
    })

    // 初始化所有商品，确保没有遗漏
    allGoodsFromLibrary.forEach(libraryGoods => {
      const stateGoods = stateGoodsMap.get(libraryGoods.id)
      
      // 如果 state 中有这个商品，使用 state 中的 owned 和 price
      // 否则使用商品库中的默认值
      const goodsData: GoodsData = stateGoods || {
        ...libraryGoods,
        price: 0,
        owned: 0
      }

      const goods = Goods.fromData(goodsData)
      this.goods.set(goods.id, goods)
    })

    // 确保 state.goods 包含所有商品（如果缺少某些商品，添加它们）
    this.syncStateGoods(allGoodsFromLibrary)

    debugLog(`[GoodsManager] 初始化完成，共 ${this.goods.size} 种商品，state.goods 中有 ${this.state.goods.length} 种商品`)
    
    // 验证：确保所有商品都在 state.goods 中
    this.validateGoodsCompleteness()
  }

  /**
   * 同步 state.goods，确保包含所有商品
   */
  private syncStateGoods(
    allGoodsFromLibrary: GoodsData[]
  ): void {
    const stateGoodsIds = new Set(this.state.goods.map(g => g.id))
    let hasChanges = false

    allGoodsFromLibrary.forEach(libraryGoods => {
      if (!stateGoodsIds.has(libraryGoods.id)) {
        // 如果 state.goods 中缺少这个商品，添加它
        this.state.goods.push({
          ...libraryGoods,
          price: 0,
          owned: 0
        })
        hasChanges = true
        debugLog(`[GoodsManager] 添加缺失商品到 state.goods: ${libraryGoods.name}(id=${libraryGoods.id})`)
      } else {
        // 如果 state.goods 中有这个商品，确保它的 basePrice 和 priceRange 是最新的
        const stateGoods = this.state.goods.find(g => g.id === libraryGoods.id)!
        if (stateGoods.basePrice !== libraryGoods.basePrice || 
            stateGoods.priceRange !== libraryGoods.priceRange) {
          stateGoods.basePrice = libraryGoods.basePrice
          stateGoods.priceRange = libraryGoods.priceRange
          hasChanges = true
          debugLog(`[GoodsManager] 更新商品定义: ${libraryGoods.name}(id=${libraryGoods.id})`)
        }
      }
    })

    if (hasChanges) {
      debugLog(`[GoodsManager] state.goods 已同步，当前有 ${this.state.goods.length} 种商品`)
    }
  }

  /**
   * 验证商品完整性
   * 确保所有商品都在 state.goods 中，并且所有商品都有对应的 Goods 模型
   */
  private validateGoodsCompleteness(): void {
    const allGoodsFromLibrary = this.goodsLibrary.getAllGoods()
    const missingInState: number[] = []
    const missingInManager: number[] = []

    allGoodsFromLibrary.forEach(libraryGoods => {
      const inState = this.state.goods.find(g => g.id === libraryGoods.id)
      if (!inState) {
        missingInState.push(libraryGoods.id)
      }

      const inManager = this.goods.get(libraryGoods.id)
      if (!inManager) {
        missingInManager.push(libraryGoods.id)
      }
    })

    if (missingInState.length > 0) {
      debugError(`[GoodsManager] 验证失败：state.goods 中缺少 ${missingInState.length} 种商品: [${missingInState.join(', ')}]`)
    }

    if (missingInManager.length > 0) {
      debugError(`[GoodsManager] 验证失败：GoodsManager 中缺少 ${missingInManager.length} 种商品: [${missingInManager.join(', ')}]`)
    }

    if (missingInState.length === 0 && missingInManager.length === 0) {
      debugLog(`[GoodsManager] 商品完整性验证通过：所有 ${allGoodsFromLibrary.length} 种商品都已正确初始化`)
    }
  }

  /**
   * 获取商品模型
   * 如果商品不存在，尝试从统一商品库创建
   */
  private getGoodsModel(goodsId: number): Goods | undefined {
    // 首先尝试从已初始化的商品中获取
    let goods = this.goods.get(goodsId)
    
    if (goods) {
      // 同步 state 中的数据
      const goodsData = this.goodsFinder.findById(goodsId)
      if (goodsData) {
        goods.price = goodsData.price
        goods.owned = goodsData.owned || 0
      }
      return goods
    }

    // 如果商品不存在，尝试从统一商品库创建
    const allGoodsFromLibrary = this.goodsLibrary.getAllGoods()
    const libraryGoods = allGoodsFromLibrary.find(g => g.id === goodsId)
    
    if (libraryGoods) {
      // 检查 state.goods 中是否有这个商品
      let goodsData = this.goodsFinder.findById(goodsId)
      
      if (!goodsData) {
        // 如果 state.goods 中没有，添加它
        goodsData = {
          ...libraryGoods,
          price: 0,
          owned: 0
        }
        this.state.goods.push(goodsData)
        debugLog(`[GoodsManager] 动态添加缺失商品到 state.goods: ${libraryGoods.name}(id=${goodsId})`)
      }

      goods = Goods.fromData(goodsData)
      this.goods.set(goodsId, goods)
      debugLog(`[GoodsManager] 动态创建商品模型: ${libraryGoods.name}(id=${goodsId})`)
      return goods
    }

    // 商品不存在于统一商品库中
    debugError(`[GoodsManager] 商品不存在: goodsId=${goodsId}, 可用商品ID: [${allGoodsFromLibrary.map(g => g.id).join(', ')}]`)
    return undefined
  }

  buy(goodsId: number, quantity: number = 1): boolean {
    const goods = this.getGoodsModel(goodsId)
    
    if (!goods) {
      debugError(`[GoodsManager] 购买商品失败：商品不存在 goodsId=${goodsId}`)
      this.showMessage("商品不存在！")
      return false
    }
    
    if (!goods.hasPrice()) {
      debugError(`[GoodsManager] 购买商品失败：商品价格为0或无效 goodsId=${goodsId}, price=${goods.price}`)
      this.showMessage("该商品暂无价格，无法购买！")
      return false
    }
    
    if (!goods.canBuy(this.player.cash, this.player.getAvailableSpace(), quantity)) {
      const totalCost = goods.calculatePurchaseCost(quantity)
      if (!this.player.canAfford(totalCost)) {
        debugError(`[GoodsManager] 现金不足: cash=${this.player.cash}, totalCost=${totalCost}`)
        this.showMessage("现金不足，无法购买！")
      } else {
        this.showMessage("仓库容量不足，无法购买！")
      }
      return false
    }

    const totalCost = goods.calculatePurchaseCost(quantity)
    debugLog(`[GoodsManager] 购买检查: goodsId=${goodsId}, name=${goods.name}, price=${goods.price}, quantity=${quantity}, totalCost=${totalCost}, cash=${this.player.cash}`)

    this.player.subtractCash(totalCost)
    goods.addOwned(quantity)
    
    // 同步到 state
    const goodsData = this.goodsFinder.findById(goodsId)
    if (goodsData) {
      goodsData.owned = goods.owned
      this.state.totalGoods += quantity
    }
    
    return true
  }

  sell(goodsId: number, quantity: number = 1): boolean {
    const goods = this.getGoodsModel(goodsId)
    
    if (!goods) {
      debugError(`[GoodsManager] 出售商品失败：商品不存在 goodsId=${goodsId}`)
      this.showMessage("商品不存在！")
      return false
    }

    if (!goods.canSell(quantity)) {
      debugLog(`[GoodsManager] 出售商品失败：库存不足 goodsId=${goodsId}, owned=${goods.owned}, quantity=${quantity}`)
      this.showMessage("没有足够的商品出售！")
      return false
    }

    const totalEarned = goods.calculateSaleRevenue(quantity)
    this.player.addCash(totalEarned)
    goods.removeOwned(quantity)
    
    // 同步到 state
    const goodsData = this.goodsFinder.findById(goodsId)
    if (goodsData) {
      goodsData.owned = goods.owned
      this.state.totalGoods -= quantity
    }

    this.fameService.updateFameForSelling(goods.name, quantity)

    return true
  }

  /**
   * 添加商品到库存
   * 统一使用 goodsId，确保找到正确的商品
   * 如果商品不存在于 state.goods，会自动添加
   */
  addGoods(goodsId: number, quantity: number): boolean {
    // 首先尝试从统一商品库验证商品是否存在
    const allGoodsFromLibrary = this.goodsLibrary.getAllGoods()
    const libraryGoods = allGoodsFromLibrary.find(g => g.id === goodsId)
    
    if (!libraryGoods) {
      debugError(`[GoodsManager] 商品不存在于统一商品库: goodsId=${goodsId}, 可用商品ID: [${allGoodsFromLibrary.map(g => g.id).join(', ')}]`)
      return false
    }

    // 获取或创建商品模型
    const goods = this.getGoodsModel(goodsId)
    
    if (!goods) {
      debugError(`[GoodsManager] 无法创建商品模型: goodsId=${goodsId}`)
      return false
    }

    // 确保 state.goods 中有这个商品
    let goodsData = this.goodsFinder.findById(goodsId)
    if (!goodsData) {
      // 如果 state.goods 中没有，添加它
      goodsData = {
        ...libraryGoods,
        price: goods.price,
        owned: goods.owned
      }
      this.state.goods.push(goodsData)
      debugLog(`[GoodsManager] 添加商品到 state.goods: ${libraryGoods.name}(id=${goodsId})`)
    }
    
    const availableSpace = this.player.getAvailableSpace()
    const addCount = Math.min(quantity, availableSpace)
    
    if (addCount === 0) {
      debugLog(`[GoodsManager] 仓库已满，无法添加商品: ${goods.name}`)
      this.showMessage(`可惜！你的房子太小，只能放${this.state.maxCapacity}件商品。`)
      return false
    }

    const oldOwned = goods.owned
    goods.addOwned(addCount)
    
    // 同步到 state
    goodsData.owned = goods.owned
    goodsData.price = goods.price  // 同步价格（可能被事件修改）
    this.state.totalGoods += addCount
    
    debugLog(`[GoodsManager] 添加商品成功: ${goods.name}(id=${goodsId}), 添加数量: ${addCount}, 之前拥有: ${oldOwned}, 现在拥有: ${goods.owned}, 总商品数: ${this.state.totalGoods}`)
    
    return true
  }

  getUnit(goodsName: string): string {
    const goods = Array.from(this.goods.values()).find(g => g.name === goodsName)
    return goods ? goods.getUnit() : '个'
  }

  /**
   * 获取商品模型
   */
  getGoods(goodsId: number): Goods | undefined {
    return this.getGoodsModel(goodsId)
  }

  /**
   * 获取所有商品模型
   */
  getAllGoods(): Goods[] {
    return Array.from(this.goods.values())
  }
}

