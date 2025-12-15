/**
 * 配置常量定义
 */

// 商品ID生成相关常量
export const GOODS_ID_BASE = 100000 // 商品ID基数
export const GOODS_ID_MASK = 99999  // 商品索引最大值

// 游戏时间相关常量
export const WEEKS_PER_YEAR = 52
export const GAME_UNIT = '周'
export const GAME_UNIT_DESCRIPTION = '一年'

// 价格计算相关常量
export const PRICE_WEEK_MULTIPLIER_BASE = 0.02 // 周价格变化率
export const PRICE_WEEK_MULTIPLIER_MIN = 0.8
export const PRICE_WEEK_MULTIPLIER_MAX = 1.5
export const PRICE_MULTIPLIER_DEFAULT = 1

// 季节相关常量
export const SEASONS = {
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn',
  WINTER: 'winter'
} as const

export type Season = typeof SEASONS[keyof typeof SEASONS]

// 容量相关常量
export const DEFAULT_CAPACITY = 10 // 初始容量
export const CAPACITY_EXPANSION_UNIT = 10 // 容量扩展单位

// 交通费用相关常量
export const DEFAULT_SUBWAY_FARE = 3 // 默认地铁费用

// 租金计算相关常量
export const RENT_EXPANSION_COST = 30000 // 扩展成本
export const RENT_DISCOUNT_THRESHOLD = 30000 // 折扣阈值
export const RENT_CAPACITY_MULTIPLIER = 0.1 // 容量租金倍数

// 事件相关常量
export const COMMERCIAL_RANGE = 950
export const HEALTH_RANGE = 1000
export const MONEY_RANGE = 1000

// 建筑配置相关常量
export const HOSPITAL_COST_PER_POINT = 350
export const HOSPITAL_TRIGGER_HEALTH = 85

// 成就相关常量
export const ACHIEVEMENT_PERSISTENCE_WEEKS = 30
export const ACHIEVEMENT_WEALTH_THRESHOLD = 50000
export const ACHIEVEMENT_ELITE_THRESHOLD = 100000
