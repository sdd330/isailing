import type { GameConfig } from '@/config/game.config'

export enum BuildingType {
  BANK = 'bank',
  HOSPITAL = 'hospital',
  CONSTRUCTION_SITE = 'construction_site',
  POST_OFFICE = 'post_office',
  HOUSE = 'house',
  AIRPORT = 'airport',
  TRAIN_STATION = 'train_station',
  SUBWAY = 'subway',
  RESTAURANT = 'restaurant'
}

export interface BuildingConfig {
  type: BuildingType
  name: string
  icon: string
  description: string
  cost?: number
  costPerPoint?: number
  bonusRange?: [number, number]
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
    // 租房成本现在由 BuildingManager.rentHouse() 动态计算
    // 不再需要在这里计算
    return null
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
      triggerHealth: this.type === BuildingType.HOSPITAL
        ? this.config.buildings.hospital.triggerHealth
        : undefined
    }
  }
}
