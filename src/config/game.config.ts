import type { RandomEvent, HealthEvent, MoneyEvent } from '@/types/game'
import { WEEKS_PER_YEAR, GAME_UNIT, GAME_UNIT_DESCRIPTION, HOSPITAL_COST_PER_POINT, HOSPITAL_TRIGGER_HEALTH, COMMERCIAL_RANGE, HEALTH_RANGE, MONEY_RANGE, ACHIEVEMENT_PERSISTENCE_WEEKS, ACHIEVEMENT_WEALTH_THRESHOLD, ACHIEVEMENT_ELITE_THRESHOLD, type Season } from './constants'

// 价格策略接口 - 处理价格波动逻辑
export interface PriceStrategy {
  calculatePrice(basePrice: number, priceRange: number, currentWeek?: number): number
  getPriceMultiplier(event: RandomEvent, currentWeek?: number): number
}

// 事件策略接口 - 处理随机事件逻辑
export interface EventStrategy {
  getCommercialEvents(): RandomEvent[]
  getHealthEvents(): HealthEvent[]
  getMoneyEvents(): MoneyEvent[]
  filterEventsBySeason(events: RandomEvent[], currentSeason?: Season): RandomEvent[]
}

// 交通策略接口 - 处理城市间交通费用
export interface TransportationStrategy {
  getTrainFare(toCityKey: string): number | undefined
  getPlaneFare(toCityKey: string): number | undefined
  getSubwayFare(): number
}

// 房价策略接口 - 处理房价逻辑
export interface RentStrategy {
  getBaseRent(): number
  getExpansionCost(): number
  getDiscountThreshold(): number
  calculateRentWithCapacity(capacity: number): number
  /** 获取酒店每日价格 */
  getHotelDailyPrice(): number
}

// 工作类型配置接口
export interface WorkTypeConfig {
  /** 工作类型ID */
  id: string
  /** 工作名称 */
  name: string
  /** 工作图标 */
  icon: string
  /** 工作描述 */
  description: string
  /** 收入范围 [最小值, 最大值] */
  incomeRange: [number, number]
  /** 体力消耗范围 [最小值, 最大值] */
  staminaCostRange: [number, number]
  /** 押金/成本（可选，如送外卖需要押金） */
  cost?: number
  /** 每日次数限制（可选，如送外卖每天最多4次） */
  dailyLimit?: number
}

// 房型配置接口
export interface HouseTypeConfig {
  /** 房型ID */
  id: string
  /** 房型名称 */
  name: string
  /** 房型图标 */
  icon: string
  /** 房型描述 */
  description: string
  /** 押金（一次性） */
  cost: number
  /** 月租（每月扣减） */
  monthlyRent: number
  /** 容量增加 */
  capacityIncrease: number
  /** 折扣阈值（现金超过此值可享受折扣） */
  discountThreshold?: number
}

// 建筑配置接口
export interface BuildingConfig {
  bank: {
    name: string
    icon: string
  }
  hospital: {
    name: string
    icon: string
    costPerPoint?: number
    triggerHealth?: number
  }
  constructionSite: {
    name?: string
    icon?: string
    description?: string
    workTypes: WorkTypeConfig[]  // 工作类型配置（必需）
  }
  postOffice: {
    name: string
    icon: string
    description?: string
  }
  house: {
    name?: string
    icon?: string
    description?: string
    /** 房型配置列表 */
    houseTypes?: HouseTypeConfig[]
  }
  restaurant?: {
    name?: string
    icon?: string
    description?: string
    costRange?: [number, number]
    staminaGain?: [number, number]
    foodPoisoningChance?: number
    foodPoisoningDamage?: [number, number]
  }
  subway?: {
    name: string
    icon: string
    description?: string
  }
  airport?: {
    name: string
    icon: string
    description?: string
  }
  trainStation?: {
    name: string
    icon: string
    description?: string
  }
}


// 全局游戏配置接口
export interface GameConfig {
  initial: {
    cash: number
    debt: number
    health: number
    stamina: number
    fame: number
    capacity: number
  }
  time: {
    totalWeeks: number
    unit: string
    unitDescription: string
    triggerWeeksLeft: number
  }
  financial: {
    debtInterestRate: number
    bankInterestRate: number
    maxDebtLimit: number
    hackerEnabled: boolean
  }
  buildings: BuildingConfig
  priceGeneration: {
    defaultLeaveOut: number
    finalWeeksLeaveOut: number
    transportationHubLeaveOut: number
  }
  random: {
    commercialRange: number
    healthRange: number
    moneyRange: number
  }
  dialogs: {
    defaultDepositAmount: number
    defaultWithdrawAmount: number
    quickDebtAmounts: number[]
    percentageOptions: number[]
  }
  achievements: {
    persistenceWeeks: number
    wealthThreshold: number
    eliteThreshold: number
  }
}

export const gameConfig: GameConfig = {
  initial: {
    cash: 2000,
    debt: 5000,
    health: 100,
    stamina: 100,
    fame: 100,
    // 初始容量视为行李箱容量：未在任何城市租房前，最多只能携带 10 件商品
    capacity: 10
  },
  time: {
    totalWeeks: WEEKS_PER_YEAR,
    unit: GAME_UNIT,
    unitDescription: GAME_UNIT_DESCRIPTION,
    triggerWeeksLeft: 3
  },
  financial: {
    debtInterestRate: 0.10,
    bankInterestRate: 0.01,
    maxDebtLimit: 100000,
    hackerEnabled: true
  },
  buildings: {
    bank: { name: '银行', icon: '🏦' },
    hospital: {
      name: '医院',
      icon: '🏥',
      costPerPoint: HOSPITAL_COST_PER_POINT,
      triggerHealth: HOSPITAL_TRIGGER_HEALTH
    },
    constructionSite: {
      name: '打工',
      icon: '💼',
      description: '选择工作类型赚取收入',
      workTypes: [
        {
          id: 'construction',
          name: '建筑工地',
          icon: '🏗️',
          description: '在建筑工地打工，收入较高但体力消耗大',
          incomeRange: [300, 500],
          staminaCostRange: [8, 15]
        },
        {
          id: 'delivery',
          name: '送外卖',
          icon: '🛵',
          description: '送外卖赚取收入，需要押金',
          incomeRange: [10, 50],
          staminaCostRange: [5, 10],
          cost: 15,
          dailyLimit: 4
        },
        {
          id: 'warehouse',
          name: '仓库搬运',
          icon: '📦',
          description: '在仓库搬运货物，收入中等',
          incomeRange: [200, 400],
          staminaCostRange: [6, 12]
        },
        {
          id: 'restaurant',
          name: '餐厅服务员',
          icon: '🍽️',
          description: '在餐厅当服务员，收入较低但体力消耗小',
          incomeRange: [150, 300],
          staminaCostRange: [4, 8]
        },
        {
          id: 'cleaning',
          name: '清洁工',
          icon: '🧹',
          description: '做清洁工作，收入最低但体力消耗最小',
          incomeRange: [100, 250],
          staminaCostRange: [3, 7]
        }
      ]
    },
    postOffice: {
      name: '邮局',
      icon: '📬',
      description: '偿还债务'
    },
    house: {
      name: '中介',
      icon: '🏠',
      description: '通过中介租房',
      houseTypes: [
        {
          id: 'studio',
          name: '一室一厅',
          icon: '🏘️',
          description: '一室一厅',
          cost: 3750,
          monthlyRent: 3750,
          capacityIncrease: 20
        },
        {
          id: 'one-bedroom',
          name: '两室一厅',
          icon: '🏠',
          description: '两室一厅',
          cost: 6250,
          monthlyRent: 6250,
          capacityIncrease: 40,
          discountThreshold: 30000
        },
        {
          id: 'three-bedroom',
          name: '三室两厅',
          icon: '🏡',
          description: '三室两厅',
          cost: 10000,
          monthlyRent: 10000,
          capacityIncrease: 60,
          discountThreshold: 50000
        },
        {
          id: 'luxury',
          name: '豪华公寓',
          icon: '🏰',
          description: '豪华公寓',
          cost: 15000,
          monthlyRent: 15000,
          capacityIncrease: 80,
          discountThreshold: 80000
        }
      ]
    },
    restaurant: {
      name: '饭店',
      icon: '🍜',
      description: '花钱吃一顿，恢复体力',
      costRange: [20, 120],
      staminaGain: [15, 30],
      foodPoisoningChance: 15,
      foodPoisoningDamage: [5, 15]
    },
    subway: {
      name: '地铁',
      icon: '🚇',
      description: '乘坐地铁出行'
    },
    airport: {
      name: '机场',
      icon: '✈️',
      description: '从机场乘飞机前往其他城市'
    },
    trainStation: {
      name: '火车站',
      icon: '🚄',
      description: '从火车站乘高铁前往其他城市'
    }
  },
  priceGeneration: {
    defaultLeaveOut: 3,
    finalWeeksLeaveOut: 0,
    transportationHubLeaveOut: 0
  },
  random: {
    commercialRange: COMMERCIAL_RANGE,
    healthRange: HEALTH_RANGE,
    moneyRange: MONEY_RANGE
  },
  dialogs: {
    defaultDepositAmount: 1000,
    defaultWithdrawAmount: 1000,
    quickDebtAmounts: [1000, 5000, 10000],
    percentageOptions: [0.25, 0.5, 0.75, 1.0]
  },
  achievements: {
    persistenceWeeks: ACHIEVEMENT_PERSISTENCE_WEEKS,
    wealthThreshold: ACHIEVEMENT_WEALTH_THRESHOLD,
    eliteThreshold: ACHIEVEMENT_ELITE_THRESHOLD
  }
}

