import type { RandomEvent } from '@/types/game'
import type { GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import type { IMessageHandler } from '../interfaces/IMessageHandler'
import { Random } from '../utils/Random'
import { GoodsManager } from '../managers/GoodsManager'
import { GoodsLibraryManager } from '../managers/GoodsLibraryManager'
import { debugLog, debugError } from '../../utils/debug'

export class CommercialEventHandler {
  private goodsManager: GoodsManager
  private goodsLibrary: GoodsLibraryManager

  constructor(
    private state: GameState,
    private config: GameConfig,
    private events: RandomEvent[],
    private messageHandler: IMessageHandler
  ) {
    this.goodsManager = new GoodsManager(state, config, messageHandler)
    this.goodsLibrary = new GoodsLibraryManager()
  }

  process(): void {
    let eventTriggered = false
    
    this.events.forEach((event, index) => {
      const randomNum = Random.num(this.config.random.commercialRange)
      if (randomNum % event.freq === 0) {
        // 使用 goodsId 直接查找商品，而不是使用索引
        // 因为商品可能不在 state.goods 中（跨城市商品），需要确保商品存在
        let goods = this.state.goods.find(g => g.id === event.goodsId)
        
        // 如果商品不在 state.goods 中，从统一商品库获取商品信息并添加到 state.goods
        if (!goods) {
          debugLog(`[CommercialEvent] 商品不在 state.goods 中，从统一商品库获取: goodsId=${event.goodsId}`)
          const allGoodsFromLibrary = this.goodsLibrary.getAllGoods()
          const libraryGoods = allGoodsFromLibrary.find(g => g.id === event.goodsId)
          
          if (libraryGoods) {
            // 添加商品到 state.goods，但不增加数量（owned=0）
            const newGoods = {
              ...libraryGoods,
              price: 0,
              owned: 0
            }
            this.state.goods.push(newGoods)
            goods = newGoods
            debugLog(`[CommercialEvent] 已添加商品到 state.goods: ${libraryGoods.name}(id=${event.goodsId})`)
          } else {
            debugError(`[CommercialEvent] 商品不存在于统一商品库: goodsId=${event.goodsId}, 事件: ${event.message}, 可用商品ID: [${allGoodsFromLibrary.map(g => g.id).join(', ')}]`)
            return
          }
        }
        
        if (!goods) {
          debugError(`[CommercialEvent] 无法获取商品: goodsId=${event.goodsId}`)
          return
        }
        
        const isGoodsGivenOnly = event.goodsGiven > 0 && event.priceMultiplier === 0 && event.priceDivider === 0
        
        if (goods.price === 0 && !isGoodsGivenOnly) {
          debugLog('[CommercialEvent] 跳过事件，商品价格为0:', event.message, 'goodsId:', event.goodsId, 'goodsName:', goods.name)
          return
        }
        
        let message = event.message
        
        if (event.priceMultiplier > 0) {
          const oldPrice = goods.price
          goods.price *= event.priceMultiplier
          message = `${event.message}，${goods.name}价格从${oldPrice.toLocaleString()}元涨到${goods.price.toLocaleString()}元`
        } else if (event.priceDivider > 0) {
          const oldPrice = goods.price
          goods.price = Math.floor(goods.price / event.priceDivider)
          message = `${event.message}，${goods.name}价格从${oldPrice.toLocaleString()}元跌到${goods.price.toLocaleString()}元`
        }

        if (event.goodsGiven > 0) {
          const isLastEvent = index === this.events.length - 1
          const unit = this.goodsManager.getUnit(goods.name)
          
          if (event.cost && event.cost > 0) {
            if (this.state.cash >= event.cost) {
              this.state.cash -= event.cost
              debugLog(`[CommercialEvent] 强制购买扣除现金: ${event.cost}元，剩余现金: ${this.state.cash}元`)
            } else {
              const debtIncrease = event.cost - this.state.cash
              this.state.cash = 0
              this.state.debt += debtIncrease
              debugLog(`[CommercialEvent] 强制购买现金不足，扣除所有现金，债务增加: ${debtIncrease}元`)
            }
          }
          
          const availableSpace = this.state.maxCapacity - this.state.totalGoods
          const oldOwned = goods.owned || 0
          debugLog('[CommercialEvent] 准备添加商品:', {
            goodsId: event.goodsId,
            goodsName: goods.name,
            quantity: event.goodsGiven,
            currentOwned: oldOwned,
            totalGoods: this.state.totalGoods,
            maxCapacity: this.state.maxCapacity,
            availableSpace: availableSpace,
            cost: event.cost
          })
          
          // 使用 goodsId 添加商品，addGoods 会确保商品存在于 state.goods 中
          const added = this.goodsManager.addGoods(event.goodsId, event.goodsGiven)
          
          // 使用 goodsId 查找更新后的商品，确保获取到正确的商品
          const updatedGoods = this.state.goods.find(g => g.id === event.goodsId)
          
          if (!updatedGoods) {
            debugError(`[CommercialEvent] 添加商品后找不到商品: goodsId=${event.goodsId}`)
            return
          }
          
          debugLog('[CommercialEvent] 添加商品结果:', {
            added,
            goodsId: event.goodsId,
            goodsName: updatedGoods?.name || '未知',
            oldOwned: oldOwned,
            newOwned: updatedGoods?.owned || 0,
            newTotalGoods: this.state.totalGoods,
            allGoodsIds: this.state.goods.map(g => `${g.name}(id=${g.id}, owned=${g.owned})`)
          })
          
          // 验证商品数量是否正确增加
          // 注意：实际增加的数量可能小于 event.goodsGiven（如果仓库容量不足）
          if (added && updatedGoods) {
            const expectedIncrease = Math.min(event.goodsGiven, this.state.maxCapacity - this.state.totalGoods + oldOwned)
            const actualIncrease = updatedGoods.owned - oldOwned
            if (actualIncrease !== expectedIncrease) {
              debugError(`[CommercialEvent] 商品添加验证失败！goodsId=${event.goodsId}, 期望增加: ${expectedIncrease}, 实际增加: ${actualIncrease}, 之前拥有: ${oldOwned}, 现在拥有: ${updatedGoods.owned}`)
            } else {
              debugLog(`[CommercialEvent] 商品添加验证通过！goodsId=${event.goodsId}, 商品名称: ${updatedGoods.name}, 增加数量: ${actualIncrease}`)
            }
          }
          
          if (isLastEvent) {
            this.state.debt += 2500
            if (added && updatedGoods) {
              const costText = event.cost ? `，花费${event.cost}元` : ''
              message = `${event.message}，获得${event.goodsGiven}部${updatedGoods.name}${costText}，债务+2500元`
            } else {
              const costText = event.cost ? `，花费${event.cost}元` : ''
              message = `${event.message}${costText}，仓库已满，无法获得商品，债务+2500元`
            }
          } else {
            if (added && updatedGoods) {
              const costText = event.cost ? `，花费${event.cost}元` : ''
              message = `${event.message}，获得${event.goodsGiven}${unit}${updatedGoods.name}${costText}`
            } else {
              const costText = event.cost ? `，花费${event.cost}元` : ''
              message = `${event.message}${costText}，仓库已满，无法获得商品`
              debugLog('[CommercialEvent] 仓库已满，无法添加商品:', event.goodsId, event.goodsGiven)
              this.messageHandler.show(message)
              eventTriggered = true
              return
            }
          }
        }
        
        debugLog('[CommercialEvent] 触发事件:', message, '随机数:', randomNum, 'freq:', event.freq)
        this.messageHandler.show(message)
        eventTriggered = true
      }
    })
    
    if (!eventTriggered && this.events.length > 0) {
      const availableEvents = this.events.filter((event) => {
        const goods = this.state.goods.find(g => g.id === event.goodsId)
        return goods && goods.price > 0
      })
      
      if (availableEvents.length > 0) {
        const randomIndex = Random.num(availableEvents.length)
        const fallbackEvent = availableEvents[randomIndex]
        if (!fallbackEvent) {
          return
        }
        
        // 使用 goodsId 查找商品，如果不存在则从统一商品库获取
        let goods = this.state.goods.find(g => g.id === fallbackEvent.goodsId)
        
        if (!goods) {
          debugLog(`[CommercialEvent] 保底事件商品不在 state.goods 中，从统一商品库获取: goodsId=${fallbackEvent.goodsId}`)
          const allGoodsFromLibrary = this.goodsLibrary.getAllGoods()
          const libraryGoods = allGoodsFromLibrary.find(g => g.id === fallbackEvent.goodsId)
          
          if (libraryGoods) {
            const newGoods = {
              ...libraryGoods,
              price: 0,
              owned: 0
            }
            this.state.goods.push(newGoods)
            goods = newGoods
            debugLog(`[CommercialEvent] 已添加保底事件商品到 state.goods: ${libraryGoods.name}(id=${fallbackEvent.goodsId})`)
          } else {
            debugError(`[CommercialEvent] 保底事件商品不存在于统一商品库: goodsId=${fallbackEvent.goodsId}, 事件: ${fallbackEvent.message}`)
            return
          }
        }
        
        if (!goods) {
          debugError(`[CommercialEvent] 无法获取保底事件商品: goodsId=${fallbackEvent.goodsId}`)
          return
        }
        
        let message = fallbackEvent.message
        
        if (fallbackEvent.priceMultiplier > 0) {
          const oldPrice = goods.price
          goods.price *= fallbackEvent.priceMultiplier
          message = `${fallbackEvent.message}，${goods.name}价格从${oldPrice.toLocaleString()}元涨到${goods.price.toLocaleString()}元`
        } else if (fallbackEvent.priceDivider > 0) {
          const oldPrice = goods.price
          goods.price = Math.floor(goods.price / fallbackEvent.priceDivider)
          message = `${fallbackEvent.message}，${goods.name}价格从${oldPrice.toLocaleString()}元跌到${goods.price.toLocaleString()}元`
        }
        
        if (fallbackEvent.goodsGiven > 0) {
          // 如果是强制购买事件，先扣除现金
          if (fallbackEvent.cost && fallbackEvent.cost > 0) {
            if (this.state.cash >= fallbackEvent.cost) {
              this.state.cash -= fallbackEvent.cost
            } else {
              const debtIncrease = fallbackEvent.cost - this.state.cash
              this.state.cash = 0
              this.state.debt += debtIncrease
            }
          }
          
          const unit = this.goodsManager.getUnit(goods.name)
          // 使用 goodsId 而不是 goodsIndex，确保找到正确的商品
          const added = this.goodsManager.addGoods(fallbackEvent.goodsId, fallbackEvent.goodsGiven)
          
          // 获取更新后的商品信息
          const updatedGoods = this.state.goods.find(g => g.id === fallbackEvent.goodsId)
          
          if (added && updatedGoods) {
            const costText = fallbackEvent.cost ? `，花费${fallbackEvent.cost}元` : ''
            message = `${fallbackEvent.message}，获得${fallbackEvent.goodsGiven}${unit}${updatedGoods.name}${costText}`
          } else {
            const costText = fallbackEvent.cost ? `，花费${fallbackEvent.cost}元` : ''
            message = `${fallbackEvent.message}${costText}，仓库已满，无法获得商品`
          }
        }
        
        debugLog('[CommercialEvent] 保底触发事件:', message)
        this.messageHandler.show(message)
      }
    }
  }
}

