import { CityConfig } from './ConfigManager'
import { GOODS_ID_BASE } from './constants'

/**
 * 城市ID映射
 * 用于生成全局唯一的商品ID
 */
export const CITY_ID_MAP: Record<string, number> = {
  '北京': 0,
  '上海': 1,
  '广州': 2,
  '深圳': 3,
  '杭州': 4,
  '苏州': 5,
  '天津': 6,
  '青岛': 7
}

/**
 * 根据城市名称获取城市ID
 */
export function getCityId(cityName: string): number {
  return CITY_ID_MAP[cityName] ?? 0
}

/**
 * 根据城市ID和商品索引生成全局唯一的商品ID
 * goodsId = 城市ID * GOODS_ID_BASE + 商品index
 */
export function generateGoodsId(cityId: number, goodsIndex: number): number {
  return cityId * GOODS_ID_BASE + goodsIndex
}

/**
 * 从商品ID解析城市ID和商品索引
 * 使用新的CityConfig.parseGoodsId方法（静态方法）
 */
export function parseGoodsId(goodsId: number): { cityId: number; goodsIndex: number } {
  return CityConfig.parseGoodsId(goodsId)
}

/**
 * 根据城市ID获取城市名称
 */
export function getCityNameById(cityId: number): string {
  const cityNames = Object.keys(CITY_ID_MAP)
  const cityName = cityNames.find(name => CITY_ID_MAP[name] === cityId)
  return cityName || '未知城市'
}

/**
 * 获取所有城市信息
 */
export function getAllCities(): Array<{ id: number; name: string }> {
  return Object.entries(CITY_ID_MAP).map(([name, id]) => ({ id, name }))
}

