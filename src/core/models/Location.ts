import type { LocationDefinition } from '@/types/game'

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
   * 从地点定义创建 Location 实例
   * @param definition 地点定义（配置数据）
   * @param type 地点类型（可选，如果不提供则根据描述自动推断）
   */
  static fromDefinition(definition: LocationDefinition, type?: LocationType): Location {
    return new Location(definition.id, definition.name, definition.description, type || LocationType.UNKNOWN)
  }

  /**
   * 转换为地点定义（用于配置系统）
   */
  toDefinition(): LocationDefinition {
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
