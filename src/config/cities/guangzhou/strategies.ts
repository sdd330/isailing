// 广州城市策略实现
import {
  BasePriceStrategy, BaseEventStrategy, BaseTransportationStrategy, BaseRentStrategy
} from '../../ConfigManager'


// 广州价格策略 - 广交会繁荣
export class GuangzhouPriceStrategy extends BasePriceStrategy {
  calculatePrice(basePrice: number, priceRange: number, currentWeek?: number): number {
    const base = super.calculatePrice(basePrice, priceRange, currentWeek)
    const week = currentWeek || 1

    // 广交会期间（春季和秋季）价格上涨
    if ((week >= 8 && week <= 12) || (week >= 35 && week <= 40)) {
      const tradeFairMultiplier = 1.3 + Math.random() * 0.2
      return Math.round(base * tradeFairMultiplier)
    }

    return base
  }
}


// 广州事件策略 - 亚热带气候，肠胃不适、粤菜过敏、空调病多发
export class GuangzhouEventStrategy extends BaseEventStrategy {
  constructor() {
    super(
      // 商业事件
      [
        { freq: 150, message: '广交会开幕，进口商品价格×3', goodsId: 200000, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 110, message: '广州塔夜景，旅游纪念品价格×2', goodsId: 200001, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 95, message: '花城广场，鲜花价格×2', goodsId: 200002, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 80, message: '西关大屋，传统工艺品价格×3', goodsId: 200003, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 70, message: '北京路步行街，化妆品价格×2', goodsId: 200007, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 85, message: '天河城商圈，潮流服饰价格×2', goodsId: 200004, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 60, message: '珠江夜游，船票价格×2', goodsId: 200005, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 90, message: '白云机场，旅行用品价格×2', goodsId: 200006, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 75, message: '黄埔古港，历史文物价格×3', goodsId: 200008, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 65, message: '岭南印象园，文化演出票价格×2', goodsId: 200009, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        // 春季广交会
        { freq: 25, message: '春季广交会，电子产品价格×3', goodsId: 200006, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0, tags: ['广交会'] },
        // 秋季广交会
        { freq: 25, message: '秋季广交会，进口商品价格×3', goodsId: 200000, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0, tags: ['广交会'] },
        // 端午：龙舟节
        { freq: 28, message: '端午龙舟节，粽子礼盒价格×2', goodsId: 200003, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0, tags: ['端午'] },
        // 中秋：月饼热销
        { freq: 30, message: '中秋月饼礼盒价格×3', goodsId: 200004, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0, tags: ['中秋'] },
        // 重阳：登高节
        { freq: 26, message: '重阳登高，登山装备价格×2', goodsId: 200005, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0, tags: ['重阳'] }
      ],
      // 健康事件
      [
        { freq: 180, message: '亚热带气候，肠胃不适', damage: 3, sound: 'breath.wav' },
        { freq: 140, message: '粤菜太辣，肠胃炎发作', damage: 2, sound: 'breath.wav' },
        { freq: 120, message: '空调病频发，头晕乏力', damage: 2, sound: 'breath.wav' },
        { freq: 100, message: '潮湿环境，关节疼痛', damage: 1, sound: 'breath.wav' },
        { freq: 90, message: '夏季炎热，中暑风险', damage: 2, sound: 'breath.wav', tags: ['summer'] },
        { freq: 85, message: '昼夜温差大，感冒频发', damage: 1, sound: 'breath.wav' }
      ],
      // 金钱事件
      [
        { freq: 80, message: '广交会期间，住宿费用上涨', cashMultiplier: 20 },
        { freq: 100, message: '花城广场消费，临时开销', cashMultiplier: 15 },
        { freq: 70, message: '白云机场打车，费用增加', cashMultiplier: 25 },
        { freq: 90, message: '天河城购物，信用卡透支', cashMultiplier: 30 },
        { freq: 60, message: '珠江夜游消费过高，预算超支', cashMultiplier: 18 },
        { freq: 85, message: '买了假冒广交会商品，退货损失', cashMultiplier: 12 }
      ]
    )
  }
}


// 广州交通策略 - 华南交通枢纽
export class GuangzhouTransportationStrategy extends BaseTransportationStrategy {
  constructor() {
    super(
      {
        'beijing': 550,   // 广州南到北京西高铁约450-650元
        'shanghai': 550,  // 广州南到上海虹桥高铁约450-650元
        'shenzhen': 65,   // 广州南到深圳北高铁约60-80元
        'hangzhou': 550,  // 广州南到杭州东高铁约450-650元
        'suzhou': 600,    // 广州南到苏州北高铁约500-700元
        'tianjin': 650,   // 广州南到天津西高铁约550-750元
        'qingdao': 700    // 广州南到青岛高铁约600-800元
      },
      {
        'beijing': 1500,  // 广州白云机场到北京首都机场约1200-1600元
        'shanghai': 1500, // 广州白云机场到上海浦东约1200-1600元
        'shenzhen': 300,  // 广州白云机场到深圳宝安约200-400元
        'hangzhou': 1200, // 广州白云机场到杭州萧山约1000-1400元
        'suzhou': 1400,   // 广州白云机场到南京禄口约1200-1600元
        'tianjin': 1500,  // 广州白云机场到天津滨海约1300-1700元
        'qingdao': 1200   // 广州白云机场到青岛流亭约1000-1400元
      },
      3 // 广州地铁起步价2元，平均3元
    )
  }
}


// 广州租金策略 - 高房价城市
export class GuangzhouRentStrategy extends BaseRentStrategy {
  constructor() {
    super(3500, 350) // 月租3500元，酒店350元/天
  }
}
