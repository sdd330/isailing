import { currentTheme } from '@/config/theme.config'

export const GOODS_DATA = currentTheme.goods
export const COMMERCIAL_EVENTS = currentTheme.events.commercial
export const HEALTH_EVENTS = currentTheme.events.health
export const MONEY_EVENTS = currentTheme.events.money
export const LOCATIONS = currentTheme.city.locations

import { gameConfig } from '@/config/game.config'

export const GAME_CONSTANTS = {
  INITIAL_CASH: gameConfig.initial.cash,
  INITIAL_DEBT: gameConfig.initial.debt,
  INITIAL_HEALTH: gameConfig.initial.health,
  INITIAL_FAME: gameConfig.initial.fame,
  INITIAL_CAPACITY: gameConfig.initial.capacity,
  TOTAL_WEEKS: gameConfig.time.totalWeeks,
  TIME_UNIT: gameConfig.time.unit,
  TIME_UNIT_DESCRIPTION: gameConfig.time.unitDescription,
  DEBT_INTEREST_RATE: gameConfig.financial.debtInterestRate,
  BANK_INTEREST_RATE: gameConfig.financial.bankInterestRate,
  HOSPITAL_COST_PER_POINT: gameConfig.buildings.hospital.costPerPoint,
  DELIVERY_COST: gameConfig.buildings.delivery.cost,
  HOUSE_EXPANSION_COST: gameConfig.buildings.house.expansionCost,
  HOUSE_DISCOUNT_THRESHOLD: gameConfig.buildings.house.discountThreshold,
  MAX_DEBT_LIMIT: gameConfig.financial.maxDebtLimit,
  HOSPITAL_TRIGGER_HEALTH: gameConfig.buildings.hospital.triggerHealth,
  HOSPITAL_TRIGGER_WEEKS_LEFT: gameConfig.time.triggerWeeksLeft
}

export const SCORE_EVALUATIONS = [
  { min: 10000000, message: "你的钱太多了，建议向国家申报资产" },
  { min: 100000, message: "银行长途电话：'哇！你是大款！'" },
  { min: 1000, message: "银行长途电话：'嗯，你还可以'" },
  { min: 0, message: "银行长途电话：'你太穷了，去要饭吧！'" }
]
