import type { PredictionMarketEvent } from '@/types/game'
import { configManager } from './theme.config'

/**
 * 预测市场事件配置
 * 类似 PolyMarket 的预测市场，包含各种游戏内事件的预测
 */

/**
 * 商品预测配置接口
 */
interface GoodsPredictionConfig {
  name: string
  basePrice: number
  priceRange: number
  hasPricePrediction: boolean
  hasChangePrediction: boolean
}

/**
 * 获取指定城市的商品配置
 * 从当前城市的商品配置中获取完整的商品信息
 */
function getCityPredictionGoods(cityKey: string): GoodsPredictionConfig[] {
  try {
    const goods = configManager.getGoodsList(cityKey)
    return goods.map(good => {
      // 根据商品特征决定是否提供价格变化预测
      const isHighValue = good.basePrice > 1000 // 高价值商品
      const isVolatile = ['进口香烟', '走私汽车', '水货手机', '进口电子产品', '进口玩具', 'Labubu限量盲盒', 'YOYO酱潮玩', 'Labubu盲盒', 'YOYO酱手办'].includes(good.name) // 波动性商品

      return {
        name: good.name,
        basePrice: good.basePrice,
        priceRange: good.priceRange,
        hasPricePrediction: true, // 所有商品都有价格区间预测
        hasChangePrediction: isHighValue || isVolatile // 高价值或波动性商品有涨跌预测
      }
    })
  } catch (error) {
    // 如果获取失败，使用默认商品配置
    console.warn(`Failed to get goods for city ${cityKey}, using default config:`, error)
    return [
      { name: '进口香烟', basePrice: 500, priceRange: 300, hasPricePrediction: true, hasChangePrediction: true },
      { name: '走私汽车', basePrice: 20000, priceRange: 10000, hasPricePrediction: true, hasChangePrediction: true },
      { name: '潮玩手办', basePrice: 200, priceRange: 150, hasPricePrediction: true, hasChangePrediction: false },
      { name: '山西假白酒', basePrice: 100, priceRange: 80, hasPricePrediction: true, hasChangePrediction: false },
      { name: '进口玩具', basePrice: 300, priceRange: 200, hasPricePrediction: true, hasChangePrediction: true },
      { name: '水货手机', basePrice: 1500, priceRange: 800, hasPricePrediction: true, hasChangePrediction: true },
      { name: '伪劣化妆品', basePrice: 50, priceRange: 40, hasPricePrediction: true, hasChangePrediction: false }
    ]
  }
}

/**
 * 获取所有城市的商品配置（用于预生成预测事件模板）
 * 从所有城市的商品配置中获取，去重后保留完整信息
 */
function getAllCitiesPredictionGoods(): GoodsPredictionConfig[] {
  try {
    const allGoods = new Map<string, GoodsPredictionConfig>()

    // 遍历所有城市配置
    const cities = ['shanghai', 'beijing', 'shenzhen', 'hangzhou', 'suzhou', 'tianjin', 'qingdao', 'guangzhou']
    cities.forEach(cityKey => {
      const cityGoods = getCityPredictionGoods(cityKey)
      cityGoods.forEach(good => {
        if (!allGoods.has(good.name)) {
          allGoods.set(good.name, good)
        }
      })
    })

    return Array.from(allGoods.values())
  } catch (error) {
    console.warn('Failed to get all cities goods, using default config:', error)
    return getCityPredictionGoods('shanghai') // 返回上海的配置作为默认
  }
}

/**
 * 根据商品价格生成智能的价格区间选项
 */
function generatePriceRangeOptions(basePrice: number, priceRange: number): Array<{ id: string; text: string }> {
  const minPrice = Math.max(0, basePrice - priceRange)
  const maxPrice = basePrice + priceRange

  // 根据商品价格范围生成合适的预测选项
  if (maxPrice <= 100) {
    return [
      { id: 'under_30', text: '<30元' },
      { id: '30_60', text: '30-60元' },
      { id: '60_100', text: '60-100元' },
      { id: 'over_100', text: '>100元' }
    ]
  } else if (maxPrice <= 500) {
    return [
      { id: 'under_100', text: '<100元' },
      { id: '100_200', text: '100-200元' },
      { id: '200_400', text: '200-400元' },
      { id: 'over_400', text: '>400元' }
    ]
  } else if (maxPrice <= 2000) {
    return [
      { id: 'under_500', text: '<500元' },
      { id: '500_1000', text: '500-1000元' },
      { id: '1000_2000', text: '1000-2000元' },
      { id: 'over_2000', text: '>2000元' }
    ]
  } else {
    return [
      { id: 'under_2000', text: '<2000元' },
      { id: '2000_5000', text: '2000-5000元' },
      { id: '5000_10000', text: '5000-10000元' },
      { id: 'over_10000', text: '>10000元' }
    ]
  }
}

/**
 * 动态生成商品预测事件
 */
type GoodsPredictionEvent = Omit<PredictionMarketEvent, 'status' | 'createdAt' | 'options'> & { options: Array<{ id: string; text: string }> }

function generateGoodsPredictionEvents(): GoodsPredictionEvent[] {
  const events: GoodsPredictionEvent[] = []
  const allGoods = getAllCitiesPredictionGoods()

  // 为每个商品生成预测事件
  allGoods.forEach(goods => {
    // 生成价格区间预测
    if (goods.hasPricePrediction) {
      const priceOptions = generatePriceRangeOptions(goods.basePrice, goods.priceRange)

      events.push({
        id: `goods_${goods.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_price`,
        title: `${goods.name}下周价位`,
        description: `预测下周${goods.name}在黑市的具体价格区间（基准价：${goods.basePrice}元）`,
        options: priceOptions,
        settlementWeek: 1,
        minBet: Math.max(50, Math.floor(goods.basePrice * 0.05)), // 最低投注为基准价的5%
        maxBet: Math.min(5000, Math.floor(goods.basePrice * 0.5)) // 最高投注为基准价的50%
      })
    }

    // 生成涨跌预测（仅对高价值或波动性商品）
    if (goods.hasChangePrediction) {
      events.push({
        id: `goods_${goods.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_change`,
        title: `${goods.name}涨跌预测`,
        description: `预测下周${goods.name}的价格涨跌幅度`,
        options: [
          { id: 'rise_over_30', text: '上涨30%+' },
          { id: 'rise_10_30', text: '上涨10-30%' },
          { id: 'change_under_10', text: '±10%以内' },
          { id: 'fall_10_30', text: '下跌10-30%' },
          { id: 'fall_over_30', text: '下跌30%+' }
        ],
        settlementWeek: 1,
        minBet: Math.max(100, Math.floor(goods.basePrice * 0.1)), // 最低投注为基准价的10%
        maxBet: Math.min(10000, Math.floor(goods.basePrice * 1.0)) // 最高投注为基准价的100%
      })
    }
  })

  return events
}

export const PREDICTION_MARKET_EVENTS = generateGoodsPredictionEvents()

/**
 * 根据当前游戏状态生成可用的预测市场事件
 * @param currentWeek 当前周数
 * @param gameState 游戏状态
 * @returns 可用的事件列表
 */
export function generateAvailableEvents(
  currentWeek: number,
  gameState: {
    cash: number
    debt: number
    health: number
    currentCity: string
    cityVisitsThisWeek: string[]
  }
): Array<Omit<PredictionMarketEvent, 'status' | 'createdAt'>> {
  const available: Array<Omit<PredictionMarketEvent, 'status' | 'createdAt'>> = []

  // 获取当前城市的商品配置，然后随机选择3-5个进行预测，避免预测事件过多
  const cityPredictionGoods = getCityPredictionGoods(gameState.currentCity)
  const shuffledGoods = [...cityPredictionGoods].sort(() => Math.random() - 0.5)
  const selectedGoods = shuffledGoods.slice(0, Math.floor(Math.random() * 3) + 3) // 3-5个商品

  // 为选中的商品生成预测事件
  selectedGoods.forEach(goods => {
    // 价格预测事件
    if (goods.hasPricePrediction) {
      const priceEventTemplate = PREDICTION_MARKET_EVENTS.find(e =>
        e.id === `goods_${goods.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_price`
      )

      if (priceEventTemplate && gameState.cash >= priceEventTemplate.minBet) {
        const settlementWeek = currentWeek + priceEventTemplate.settlementWeek

        const options = priceEventTemplate.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          odds: 1 / priceEventTemplate.options.length, // 初始平均概率
          totalBets: 0
        }))

        available.push({
          ...priceEventTemplate,
          options,
          settlementWeek
        })
      }
    }

    // 价格变化预测事件（仅对配置了变化预测的商品）
    if (goods.hasChangePrediction) {
      const changeEventTemplate = PREDICTION_MARKET_EVENTS.find(e =>
        e.id === `goods_${goods.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_change`
      )

      if (changeEventTemplate && gameState.cash >= changeEventTemplate.minBet) {
        const settlementWeek = currentWeek + changeEventTemplate.settlementWeek

        const options = changeEventTemplate.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          odds: 1 / changeEventTemplate.options.length, // 初始平均概率
          totalBets: 0
        }))

        available.push({
          ...changeEventTemplate,
          options,
          settlementWeek
        })
      }
    }
  })

  return available
}

