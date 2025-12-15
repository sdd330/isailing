export interface Goods {
  id: number
  name: string
  price: number
  basePrice: number
  priceRange: number
  owned: number
}

export interface GameState {
  cash: number
  debt: number
  bankSavings: number
  health: number
  fame: number
  timeLeft: number
  currentLocation: number
  goods: Goods[]
  totalGoods: number
  maxCapacity: number
  deliveryVisits: number
  currentCity: string
  cityVisitsThisWeek: string[]
  soundEnabled: boolean
  isGameOver: boolean
  gameResult: GameResult | null
}

export interface GameResult {
  finalScore: number
  evaluation: string
  timePlayed: number
}

export interface RandomEvent {
  freq: number
  message: string
  goodsId: number
  priceMultiplier: number
  priceDivider: number
  goodsGiven: number
  cost?: number // 强制购买时的成本
}

export interface HealthEvent {
  freq: number
  message: string
  damage: number
  sound: string
}

export interface MoneyEvent {
  freq: number
  message: string
  cashMultiplier: number
  cashBased?: boolean
  minCash?: number
  maxCash?: number
  profitMultiplier?: number
  lossMultiplier?: number
  isProfit?: boolean
}


export interface Location {
  id: number
  name: string
  description: string
}
