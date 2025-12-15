import type { GameConfig } from '@/config/game.config'

export enum BuildingType {
  BANK = 'bank',
  HOSPITAL = 'hospital',
  DELIVERY = 'delivery',
  CONSTRUCTION_SITE = 'construction_site',
  POST_OFFICE = 'post_office',
  HOUSE = 'house',
  AIRPORT = 'airport',
  TRAIN_STATION = 'train_station'
}

export interface BuildingConfig {
  type: BuildingType
  name: string
  icon: string
  description: string
  cost?: number
  costPerPoint?: number
  bonusRange?: [number, number]
  expansionCost?: number
  discountThreshold?: number
  capacityIncrease?: number
  triggerHealth?: number
}

export class Building {
  constructor(
    public readonly type: BuildingType,
    public readonly name: string,
    public readonly icon: string,
    public readonly description: string,
    private config: GameConfig
  ) {}

  getCost(): number | null {
    switch (this.type) {
      case BuildingType.DELIVERY:
        return this.config.buildings.delivery.cost
      case BuildingType.HOUSE:
        return this.calculateHouseCost()
      default:
        return null
    }
  }

  private calculateHouseCost(): number {
    const baseCost = this.config.buildings.house.expansionCost
    // 这里需要访问游戏状态来判断是否有折扣
    // 但 Building 对象不应该直接访问 GameState
    // 所以这个方法应该移到 BuildingManager
    return baseCost
  }

  canAfford(cash: number): boolean {
    const cost = this.getCost()
    return cost === null || cash >= cost
  }

  getInfo(): BuildingConfig {
    return {
      type: this.type,
      name: this.name,
      icon: this.icon,
      description: this.description,
      cost: this.getCost() || undefined,
      costPerPoint: this.type === BuildingType.HOSPITAL 
        ? this.config.buildings.hospital.costPerPoint 
        : undefined,
      bonusRange: this.type === BuildingType.DELIVERY
        ? this.config.buildings.delivery.bonusRange
        : undefined,
      expansionCost: this.type === BuildingType.HOUSE
        ? this.config.buildings.house.expansionCost
        : undefined,
      discountThreshold: this.type === BuildingType.HOUSE
        ? this.config.buildings.house.discountThreshold
        : undefined,
      capacityIncrease: this.type === BuildingType.HOUSE
        ? this.config.buildings.house.capacityIncrease
        : undefined,
      triggerHealth: this.type === BuildingType.HOSPITAL
        ? this.config.buildings.hospital.triggerHealth
        : undefined
    }
  }
}
