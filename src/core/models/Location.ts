import type { Location as LocationData } from '@/types/game'

export enum LocationType {
  TRANSPORTATION_HUB = 'transportation_hub',
  COMMERCIAL_AREA = 'commercial_area',
  RESIDENTIAL_AREA = 'residential_area',
  CULTURAL_AREA = 'cultural_area',
  BUSINESS_DISTRICT = 'business_district',
  UNKNOWN = 'unknown'
}

/**
 * 地点领域模型
 * 封装地点相关的业务逻辑
 */
export class Location {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly type: LocationType = LocationType.UNKNOWN
  ) {}

  /**
   * 从数据对象创建 Location 实例
   */
  static fromData(data: LocationData, type?: LocationType): Location {
    return new Location(data.id, data.name, data.description, type || LocationType.UNKNOWN)
  }

  /**
   * 转换为数据对象
   */
  toData(): LocationData {
    return {
      id: this.id,
      name: this.name,
      description: this.description
    }
  }

  /**
   * 判断是否为交通枢纽（火车站、机场等）
   */
  isTransportationHub(): boolean {
    return this.type === LocationType.TRANSPORTATION_HUB ||
           this.name.includes('站') ||
           this.name.includes('机场') ||
           this.name.includes('火车站') ||
           this.name.includes('高铁站') ||
           this.description.includes('交通枢纽')
  }
}
