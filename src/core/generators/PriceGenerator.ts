import type { Goods } from '@/types/game'
import { Random } from '../utils/Random'
import type { GameConfig } from '@/config/game.config'
import type { City } from '../models/City'
import { LocationService } from '../services/LocationService'

export class PriceGenerator {
  constructor(
    private config: GameConfig,
    private city: City | null = null
  ) {}

  generate(goods: Goods[], leaveOut: number): void {
    const goodsWithPriceRange = goods.filter(g => g.basePrice > 0 && g.priceRange > 0)
    
    goodsWithPriceRange.forEach((item) => {
      item.price = item.basePrice + Random.num(item.priceRange)
    })

    const availableGoods = goodsWithPriceRange.filter(g => g.price > 0)
    const actualLeaveOut = Math.min(leaveOut, availableGoods.length)
    
    for (let i = 0; i < actualLeaveOut; i++) {
      if (availableGoods.length > 0) {
        const randomIndex = Random.num(availableGoods.length)
        const target = availableGoods[randomIndex]
        if (target) {
          target.price = 0
          availableGoods.splice(randomIndex, 1)
        }
      }
    }
  }

  setCity(city: City): void {
    this.city = city
  }

  getLeaveOut(currentLocation: number, timeLeft: number): number {
    // 如果当前地点是交通枢纽，使用交通枢纽的特殊配置
    if (this.city && LocationService.isTransportationHub(this.city, currentLocation)) {
      return this.config.priceGeneration.transportationHubLeaveOut
    }
    
    // 最后几周的特殊配置
    if (timeLeft <= 2) {
      return this.config.priceGeneration.finalWeeksLeaveOut
    }
    
    // 默认配置
    return this.config.priceGeneration.defaultLeaveOut
  }
}

