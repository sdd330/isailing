/**
 * 城市ID映射
 * 用于生成全局唯一的商品ID
 */
export const CITY_ID_MAP: Record<string, number> = {
  '北京': 0,
  '上海': 1,
  '广州': 2
}

/**
 * 根据城市名称获取城市ID
 */
export function getCityId(cityName: string): number {
  return CITY_ID_MAP[cityName] ?? 0
}

/**
 * 根据城市ID和商品索引生成全局唯一的商品ID
 * goodsId = 城市ID * 100000 + 商品index
 */
export function generateGoodsId(cityId: number, goodsIndex: number): number {
  return cityId * 100000 + goodsIndex
}

/**
 * 从商品ID解析城市ID和商品索引
 */
export function parseGoodsId(goodsId: number): { cityId: number; goodsIndex: number } {
  return {
    cityId: Math.floor(goodsId / 100000),
    goodsIndex: goodsId % 100000
  }
}

