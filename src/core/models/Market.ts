import type { Goods as GoodsData } from '@/types/game'

export interface MarketGoods {
  goods: GoodsData
  canAfford: boolean
  hasSpace: boolean
  canBuy: boolean
  status: 'available' | 'insufficient_funds' | 'insufficient_space'
}

export class Market {
  private goods: MarketGoods[] = []
  private cityName: string

  constructor(cityName: string) {
    this.cityName = cityName
  }

  addGoods(marketGoods: MarketGoods): void {
    this.goods.push(marketGoods)
  }

  getAvailableGoods(): MarketGoods[] {
    return this.goods.filter(g => g.goods.price > 0)
  }

  getPurchasableGoods(): MarketGoods[] {
    return this.goods.filter(g => g.canBuy)
  }

  getGoodsById(goodsId: number): MarketGoods | undefined {
    return this.goods.find(g => g.goods.id === goodsId)
  }

  getGoodsCount(): number {
    return this.goods.length
  }

  getPurchasableCount(): number {
    return this.getPurchasableGoods().length
  }

  isEmpty(): boolean {
    return this.getAvailableGoods().length === 0
  }

  getCityName(): string {
    return this.cityName
  }

  clear(): void {
    this.goods = []
  }

  sortByPrice(ascending: boolean = true): void {
    this.goods.sort((a, b) => {
      return ascending 
        ? a.goods.price - b.goods.price
        : b.goods.price - a.goods.price
    })
  }
}
