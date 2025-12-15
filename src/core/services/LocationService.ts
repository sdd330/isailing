import { City } from '../models/City'
import { Location } from '../models/Location'

/**
 * 地点服务
 * 提供地点相关的查询和随机选择功能
 */
export class LocationService {
  /**
   * 从城市获取随机地点
   */
  static getRandomLocation(city: City): Location | null {
    const locations = city.getLocations()
    if (locations.length === 0) {
      return null
    }
    const randomIndex = Math.floor(Math.random() * locations.length)
    return locations[randomIndex] ?? null
  }

  /**
   * 从城市获取地点名称
   */
  static getRandomLocationName(city: City): string {
    const location = this.getRandomLocation(city)
    return location ? location.name : '未知地点'
  }

  /**
   * 获取当前地点（根据 currentLocation ID）
   */
  static getCurrentLocation(city: City, locationId: number): Location | null {
    const location = city.getLocationById(locationId)
    return location || null
  }

  /**
   * 判断当前地点是否为交通枢纽
   */
  static isTransportationHub(city: City, locationId: number): boolean {
    const location = this.getCurrentLocation(city, locationId)
    return location ? location.isTransportationHub() : false
  }
}
