/**
 * 商品定义接口 - 用于配置系统中的商品模板
 * 不包含运行时状态（price, owned）
 */
export interface GoodsDefinition {
  id: number
  name: string
  basePrice: number
  priceRange: number
}

/**
 * 商品接口 - 游戏运行时的完整商品数据
 * 包含运行时状态（price, owned）
 */
export interface Goods extends GoodsDefinition {
  price: number
  owned: number
}

export interface GameState {
  cash: number
  debt: number
  bankSavings: number
  health: number
  stamina: number
  maxStamina: number
  fame: number
  timeLeft: number
  currentLocation: number
  goods: Goods[]
  totalGoods: number
  maxCapacity: number
  baseCapacity: number
  /**
   * 已在其中租房的城市名称列表（用于按城市收房租）
   * @deprecated 使用 rentedHouses 替代
   */
  rentedCities: string[]
  /**
   * 每个城市租的房型记录
   * key: 城市名称, value: 房型ID
   */
  rentedHouses: Record<string, string>
  /**
   * 每个城市的房租涨跌比例
   * key: 城市名称, value: 涨跌比例（1.0 = 原价，1.1 = 涨10%，0.9 = 跌10%）
   */
  rentMultipliers: Record<string, number>
  /**
   * 工作类型每日访问次数记录
   * key: workTypeId, value: 今日访问次数
   */
  workVisits: Record<string, number>
  currentCity: string
  cityVisitsThisWeek: string[]
  soundEnabled: boolean
  isGameOver: boolean
  gameResult: GameResult | null
  /**
   * 预测市场状态
   */
  predictionMarket: PredictionMarketState
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
  /**
   * 可选：按季节/节气生效的标签
   * - 'spring' | 'summer' | 'autumn' | 'winter'
   * - 'transition' 表示换季（春秋）
   * - 也可以直接写具体节气名，例如 '立春'、'秋分'
   */
  tags?: string[]
}

export interface HealthEvent {
  freq: number
  message: string
  damage: number
  sound: string
  /**
   * 可选：按季节/节气生效的标签
   * - 'spring' | 'summer' | 'autumn' | 'winter'
   * - 'transition' 表示换季（春秋）
   * - 也可以直接写具体节气名，例如 '立春'、'秋分'
   */
  tags?: string[]
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


/**
 * 地点定义接口 - 用于配置系统中的地点模板
 * 不包含运行时状态和业务逻辑
 */
export interface LocationDefinition {
  id: number
  name: string
  description: string
  /**
   * 是否在该地点存在黑市
   * - true: 明确有黑市
   * - false: 明确没有黑市
   * - undefined: 如果整座城市没有任何地点显式标记 hasMarket=true，则视为“全城都可能有黑市”
   */
  hasMarket?: boolean
  /**
   * 是否为高铁 / 火车站，用于精确控制“出城（高铁）”触发地点
   */
  isTrainStation?: boolean
  /**
   * 是否为机场，用于精确控制“出城（飞机）”触发地点
   */
  isAirport?: boolean
  /**
   * 运行时用于 UI 展示的附加元数据（例如地铁票价等），不会写回配置
   */
  meta?: {
    fare?: number
  }
  /**
   * 可选：跨城通道配置（例如花桥站这种地铁互通枢纽）
   * - targetCity: 跨城目标城市中文名（如 '上海'、'苏州'）
   * - type: 默认采用哪种交通方式理解（目前用于文案，默认 'train'）
   *   费用统一使用一个固定倍率（例如 3 倍本城地铁票价），无需单独配置
   */
  intercityTunnel?: {
    targetCity: string
    type?: 'train' | 'plane'
  }
}

/**
 * 预测市场事件定义
 */
export interface PredictionMarketEvent {
  /** 事件唯一ID */
  id: string
  /** 事件标题/问题 */
  title: string
  /** 事件描述 */
  description: string
  /** 事件选项 */
  options: PredictionMarketOption[]
  /** 结算周数（在第几周结算，0表示立即结算） */
  settlementWeek: number
  /** 最小投注金额 */
  minBet: number
  /** 最大投注金额 */
  maxBet: number
  /** 事件状态 */
  status: 'active' | 'settled'
  /** 创建时间 */
  createdAt: number
}

/**
 * 预测市场选项
 */
export interface PredictionMarketOption {
  /** 选项ID */
  id: string
  /** 选项文本 */
  text: string
  /** 当前赔率 */
  odds: number
  /** 总投注金额 */
  totalBets: number
  /** 是否为正确答案（结算后） */
  isCorrect?: boolean
}

/**
 * 预测投注记录
 */
export interface PredictionBet {
  /** 投注ID */
  id: string
  /** 事件ID */
  eventId: string
  /** 选项ID */
  optionId: string
  /** 投注金额 */
  amount: number
  /** 投注赔率 */
  odds: number
  /** 投注时间 */
  betAt: number
  /** 是否已结算 */
  settled: boolean
  /** 收益（正数为盈利，负数为亏损，0为无收益） */
  payout: number
}

/**
 * 预测市场状态
 */
export interface PredictionMarketState {
  /** 活跃事件列表 */
  activeEvents: PredictionMarketEvent[]
  /** 已结算事件列表 */
  settledEvents: PredictionMarketEvent[]
  /** 玩家投注记录 */
  bets: PredictionBet[]
  /** 总投注金额 */
  totalBetsAmount: number
  /** 总收益 */
  totalPayout: number
  /** 统计数据 */
  statistics: PredictionMarketStatistics
}

/**
 * 预测市场统计数据
 */
export interface PredictionMarketStatistics {
  /** 总预测次数 */
  totalPredictions: number
  /** 预测成功次数 */
  successfulPredictions: number
  /** 预测失败次数 */
  failedPredictions: number
  /** 胜率百分比 */
  winRate: number
  /** 净收益 */
  netProfit: number
  /** 最佳预测事件 */
  bestPrediction?: string
  /** 最差预测事件 */
  worstPrediction?: string
}
