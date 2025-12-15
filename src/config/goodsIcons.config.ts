/**
 * 商品图标映射配置
 * 统一管理所有商品的图标，避免重复定义
 */
export const GOODS_ICONS: Record<string, string> = {
  // 通用商品
  '进口香烟': '🚬',
  '走私汽车': '🚗',
  '潮玩手办': '🎮',
  '山西假白酒': '🍷',
  '进口玩具': '🧸',
  '水货手机': '📱',
  '伪劣化妆品': '💄',
  '进口电子产品': '💻',
  '服装批发': '👔',
  '茶叶': '🍵',
  '进口水果': '🍎',
  '手机配件': '🔌',
  '中药材': '🌿',

  // 上海特色商品
  '《上海小宝贝》': '📚',
  'Labubu限量盲盒': '🎁',
  'YOYO酱潮玩': '🎮',

  // 北京特色商品
  'Labubu盲盒': '🎁',
  'YOYO酱手办': '🎮',

  // 广东特色商品
  '《岭南文化》': '📚',
  '广式点心': '🥟'
}

/**
 * 获取商品图标
 * @param goodsName 商品名称
 * @returns 商品图标，如果找不到则返回默认图标
 */
export const getGoodsIcon = (goodsName: string): string => {
  return GOODS_ICONS[goodsName] || '📦'
}
