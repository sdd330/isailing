import type { Goods as GoodsData } from '@/types/game'

/**
 * 商品领域模型
 * 封装商品相关的业务逻辑
 */
export class Goods {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public basePrice: number,
    public priceRange: number,
    public price: number = 0,
    public owned: number = 0
  ) {}

  /**
   * 从数据对象创建 Goods 实例
   */
  static fromData(data: GoodsData): Goods {
    return new Goods(
      data.id,
      data.name,
      data.basePrice,
      data.priceRange,
      data.price,
      data.owned || 0
    )
  }

  /**
   * 转换为数据对象
   */
  toData(): GoodsData {
    return {
      id: this.id,
      name: this.name,
      basePrice: this.basePrice,
      priceRange: this.priceRange,
      price: this.price,
      owned: this.owned
    }
  }

  /**
   * 检查商品是否有价格
   */
  hasPrice(): boolean {
    return this.price > 0 && this.basePrice > 0 && this.priceRange > 0
  }

  /**
   * 检查是否拥有该商品
   */
  isOwned(): boolean {
    return this.owned > 0
  }

  /**
   * 检查是否可以购买
   */
  canBuy(cash: number, availableSpace: number, quantity: number = 1): boolean {
    if (!this.hasPrice()) {
      return false
    }
    const totalCost = this.price * quantity
    return cash >= totalCost && availableSpace >= quantity
  }

  /**
   * 检查是否可以出售
   */
  canSell(quantity: number = 1): boolean {
    return this.isOwned() && this.owned >= quantity
  }

  /**
   * 计算购买总价
   */
  calculatePurchaseCost(quantity: number): number {
    return this.price * quantity
  }

  /**
   * 计算出售总收入
   */
  calculateSaleRevenue(quantity: number): number {
    return this.price * quantity
  }

  /**
   * 获取商品单位
   */
  getUnit(): string {
    if (this.name.includes('香烟')) return '包'
    if (this.name.includes('白酒')) return '瓶'
    if (this.name.includes('潮玩手办') || this.name.includes('手办')) return '个'
    if (this.name.includes('汽车')) return '部'
    if (this.name.includes('手机')) return '部'
    if (this.name.includes('玩具')) return '个'
    if (this.name.includes('小宝贝')) return '册'
    if (this.name.includes('化妆品')) return '件'
    return '个'
  }

  /**
   * 更新价格
   */
  updatePrice(newPrice: number): void {
    this.price = newPrice
  }

  /**
   * 增加拥有数量
   */
  addOwned(quantity: number): void {
    this.owned += quantity
  }

  /**
   * 减少拥有数量
   */
  removeOwned(quantity: number): void {
    this.owned = Math.max(0, this.owned - quantity)
  }

  /**
   * 重置拥有数量
   */
  resetOwned(): void {
    this.owned = 0
  }
}
