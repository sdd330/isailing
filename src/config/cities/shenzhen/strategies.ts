// 深圳城市策略实现
import {
  BasePriceStrategy, BaseEventStrategy, BaseTransportationStrategy, BaseRentStrategy
} from '../../ConfigManager'


// 深圳价格策略 - 双十一购物节
export class ShenzhenPriceStrategy extends BasePriceStrategy {
  calculatePrice(basePrice: number, priceRange: number, currentWeek?: number): number {
    const base = super.calculatePrice(basePrice, priceRange, currentWeek)
    const week = currentWeek || 1

    // 双十一购物节（第45周前后）大促销
    if (week >= 43 && week <= 47) {
      const discount = 0.6 + Math.random() * 0.2 // 6-8折
      return Math.round(base * discount)
    }

    return base
  }
}


// 深圳事件策略 - 创新之都，通宵写代码、996加班、高压生活
export class ShenzhenEventStrategy extends BaseEventStrategy {
  constructor() {
    super(
      // 商业事件
      [
        { freq: 150, message: '华强北电子市场，水货电子配件价格×2', goodsId: 300000, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 110, message: '南山区科技园，游戏点卡价格×2', goodsId: 300006, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 95, message: '罗湖口岸，跨境商品价格×3', goodsId: 300003, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 80, message: '福田CBD，商务正装价格×2', goodsId: 300001, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 70, message: '大梅沙海滩，冲浪装备价格×2', goodsId: 300005, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 85, message: '世界之窗，旅游纪念品价格×2', goodsId: 300004, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 60, message: '前海自贸区，进口商品价格×3', goodsId: 300000, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 90, message: '华侨城创意文化园，手办价格×2', goodsId: 300002, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 75, message: '深圳北站，旅行用品价格×2', goodsId: 300007, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 65, message: '宝安机场，电子产品价格×2', goodsId: 300000, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        // 双十一：电商狂欢
        { freq: 35, message: '双十一电商节，水货电子配件价格÷2', goodsId: 300000, priceMultiplier: 0, priceDivider: 2, goodsGiven: 0, tags: ['双十一'] },
        // 春节：回家团圆
        { freq: 30, message: '春节返乡，火车票代售价格×3', goodsId: 300007, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0, tags: ['春节'] },
        // 清明：祭祖用品
        { freq: 28, message: '清明祭祖，冥纸冥币价格×2', goodsId: 300003, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0, tags: ['清明'] },
        // 五一：旅游高峰
        { freq: 32, message: '五一假期，大梅沙冲浪装备价格×3', goodsId: 300005, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0, tags: ['五一'] }
      ],
      // 健康事件
      [
        { freq: 180, message: '通宵写代码，眼睛酸痛', damage: 3, sound: 'breath.wav' },
        { freq: 140, message: '996加班，身体疲惫', damage: 2, sound: 'breath.wav' },
        { freq: 120, message: '高压生活，精神紧张', damage: 1, sound: 'breath.wav' },
        { freq: 100, message: '大梅沙晒太阳，中暑了', damage: 2, sound: 'breath.wav', tags: ['summer'] },
        { freq: 90, message: '空调房久坐，腰椎疼痛', damage: 1, sound: 'breath.wav' },
        { freq: 85, message: '创业压力大，失眠多梦', damage: 1, sound: 'breath.wav' }
      ],
      // 金钱事件
      [
        { freq: 80, message: '华强北买水货，临时消费', cashMultiplier: 15 },
        { freq: 100, message: '南山科技园咖啡，日常开销', cashMultiplier: 20 },
        { freq: 70, message: '罗湖口岸打车，费用增加', cashMultiplier: 25 },
        { freq: 90, message: '福田CBD吃饭，商务消费', cashMultiplier: 30 },
        { freq: 60, message: '宝安机场改签，额外费用', cashMultiplier: 12 },
        { freq: 85, message: '买了假冒电子产品，退货损失', cashMultiplier: 8 }
      ]
    )
  }
}


// 深圳交通策略 - 创新之都交通
export class ShenzhenTransportationStrategy extends BaseTransportationStrategy {
  constructor() {
    super(
      {
        'beijing': 500,   // 深圳北到北京西高铁约400-600元
        'shanghai': 500,  // 深圳北到上海虹桥高铁约400-600元
        'guangzhou': 65,  // 深圳北到广州南高铁约60-80元
        'hangzhou': 550,  // 深圳北到杭州东高铁约450-650元
        'suzhou': 600,    // 深圳北到苏州北高铁约500-700元
        'tianjin': 600,   // 深圳北到天津西高铁约500-700元
        'qingdao': 650    // 深圳北到青岛高铁约550-750元
      },
      {
        'beijing': 1400,  // 深圳宝安机场到北京首都机场约1200-1600元
        'shanghai': 1400, // 深圳宝安机场到上海浦东约1200-1600元
        'guangzhou': 300, // 深圳宝安机场到广州白云约200-400元
        'hangzhou': 1200, // 深圳宝安机场到杭州萧山约1000-1400元
        'suzhou': 1400,   // 深圳宝安机场到南京禄口约1200-1600元
        'tianjin': 1300,  // 深圳宝安机场到天津滨海约1100-1500元
        'qingdao': 1000   // 深圳宝安机场到青岛流亭约800-1200元
      },
      3 // 深圳地铁起步价2元，平均3元
    )
  }
}


// 深圳租金策略 - 高房价城市
export class ShenzhenRentStrategy extends BaseRentStrategy {
  constructor() {
    super(4800, 420) // 月租4800元，酒店420元/天
  }
}
