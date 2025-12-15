// 苏州城市策略实现
import {
  BasePriceStrategy, BaseEventStrategy, BaseTransportationStrategy, BaseRentStrategy
} from '../../ConfigManager'


// 苏州价格策略 - 婚庆季上涨
export class SuzhouPriceStrategy extends BasePriceStrategy {
  calculatePrice(basePrice: number, priceRange: number, currentWeek?: number): number {
    const base = super.calculatePrice(basePrice, priceRange, currentWeek)
    const week = currentWeek || 1

    // 婚庆高峰期（第15-20周，8-10月）价格上涨
    if (week >= 15 && week <= 20) {
      const weddingSeasonMultiplier = 1.3 + Math.random() * 0.2
      return Math.round(base * weddingSeasonMultiplier)
    }

    return base
  }
}


// 苏州事件策略 - 江南水城，手工艺品中心
export class SuzhouEventStrategy extends BaseEventStrategy {
  constructor() {
    super(
      // 商业事件
      [
        { freq: 150, message: '拙政园旅游旺季，园林门票价格×2', goodsId: 500002, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 110, message: '观前街商圈，真丝旗袍价格×3', goodsId: 500001, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 95, message: '山塘街古街，手工刺绣价格×3', goodsId: 500003, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 80, message: '苏州博物馆，文化纪念品价格×2', goodsId: 500004, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 70, message: '金鸡湖CBD，商务礼品价格×2', goodsId: 500000, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 85, message: '同里古镇，茶叶礼盒价格×2', goodsId: 500004, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 60, message: '石路商业街，小众首饰价格×2', goodsId: 500005, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 90, message: '园区湖东，电竞外设价格×2', goodsId: 500006, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 75, message: '诚品书店，文艺用品价格×2', goodsId: 500007, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 65, message: '苏州火车站，旅行用品价格×2', goodsId: 500000, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 }
      ],
      // 健康事件
      [
        { freq: 120, message: '江南水乡，石板路湿滑', damage: 2, sound: 'breath.wav' },
        { freq: 140, message: '园林游玩，着凉感冒', damage: 1, sound: 'breath.wav' },
        { freq: 90, message: '春季古镇游，风湿关节痛', damage: 2, sound: 'breath.wav', tags: ['spring'] },
        { freq: 100, message: '夏日园林，蚊虫叮咬', damage: 1, sound: 'breath.wav', tags: ['summer'] },
        { freq: 85, message: '秋季湖边，早晨雾气重', damage: 1, sound: 'breath.wav', tags: ['autumn'] }
      ],
      // 金钱事件
      [
        { freq: 80, message: '拙政园门票消费', cashMultiplier: 15 },
        { freq: 100, message: '观前街购物，消费过高', cashMultiplier: 20 },
        { freq: 70, message: '山塘街古玩，买了假货', cashMultiplier: 25 },
        { freq: 90, message: '金鸡湖吃饭，商务消费', cashMultiplier: 18 },
        { freq: 60, message: '同里古镇游，旅游开销', cashMultiplier: 22 },
        { freq: 85, message: '买了仿冒刺绣，退货损失', cashMultiplier: 10 }
      ]
    )
  }
}


// 苏州交通策略 - 江南水城交通（无机场，需到上海或南京）
export class SuzhouTransportationStrategy extends BaseTransportationStrategy {
  constructor() {
    super(
      {
        'beijing': 350,   // 苏州北到北京南高铁约300-500元
        'shanghai': 35,   // 苏州北到上海虹桥高铁约30-50元
        'guangzhou': 600, // 苏州北到广州南高铁约500-700元
        'shenzhen': 600,  // 苏州北到深圳北高铁约500-700元
        'hangzhou': 45,   // 苏州北到杭州东高铁约40-60元
        'tianjin': 350,   // 苏州北到天津西高铁约300-500元
        'qingdao': 400    // 苏州北到青岛高铁约300-500元
      },
      {
        'beijing': 1300,  // 苏州到上海机场再到北京约1200-1600元
        'shanghai': 500,  // 苏州到上海机场约300-700元
        'guangzhou': 1400,// 苏州到上海机场再到广州约1200-1600元
        'shenzhen': 1300, // 苏州到上海机场再到深圳约1100-1500元
        'hangzhou': 600,  // 苏州到上海机场再到杭州约400-800元
        'tianjin': 1200,  // 苏州到上海机场再到天津约1000-1400元
        'qingdao': 1000   // 苏州到上海机场再到青岛约800-1200元
      },
      3 // 苏州地铁起步价2元，平均3元
    )
  }
}


// 苏州租金策略 - 江南水城适中房价
export class SuzhouRentStrategy extends BaseRentStrategy {
  constructor() {
    super(2800, 300) // 月租2800元，酒店300元/天
  }
}
