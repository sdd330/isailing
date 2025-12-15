// 杭州城市策略实现
import {
  BasePriceStrategy, BaseEventStrategy, BaseTransportationStrategy, BaseRentStrategy
} from '../../ConfigManager'


// 杭州价格策略 - 春季茶价上涨
export class HangzhouPriceStrategy extends BasePriceStrategy {
  calculatePrice(basePrice: number, priceRange: number, currentWeek?: number): number {
    const base = super.calculatePrice(basePrice, priceRange, currentWeek)
    const week = currentWeek || 1

    // 春季茶叶采摘季节（第8-12周）价格上涨
    if (week >= 8 && week <= 12) {
      const teaSeasonMultiplier = 1.4 + Math.random() * 0.2
      return Math.round(base * teaSeasonMultiplier)
    }

    return base
  }
}


// 杭州事件策略 - 西湖美景，人间天堂，互联网小镇
export class HangzhouEventStrategy extends BaseEventStrategy {
  constructor() {
    super(
      // 商业事件
      [
        { freq: 150, message: '西湖边旅游旺季，茶叶礼盒价格×3', goodsId: 400004, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 110, message: '灵隐寺香火旺盛，寺庙用品价格×2', goodsId: 400005, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 95, message: '阿里总部园区，电竞外设价格×2', goodsId: 400006, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 80, message: '河坊街古街，手工艺品价格×3', goodsId: 400003, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 70, message: '龙井茶园，茶叶价格×2', goodsId: 400004, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 85, message: '西溪湿地，生态旅游价格×2', goodsId: 400005, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 60, message: '宋城旅游，演出票价格×2', goodsId: 400007, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 90, message: '钱江新城，商务礼品价格×2', goodsId: 400000, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 75, message: '千岛湖度假，旅行用品价格×2', goodsId: 400005, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 65, message: '运河古桥，摄影服务价格×2', goodsId: 400006, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        // 清明：踏青游
        { freq: 28, message: '清明踏青，西湖边茶叶价格×2', goodsId: 400004, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0, tags: ['清明'] },
        // 端午：龙舟节
        { freq: 30, message: '端午龙舟，粽子礼盒价格×2', goodsId: 400003, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0, tags: ['端午'] },
        // 重阳：登高节
        { freq: 26, message: '重阳登高，登山装备价格×2', goodsId: 400005, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0, tags: ['重阳'] }
      ],
      // 健康事件
      [
        { freq: 120, message: '西湖湿气重，关节有点不舒服', damage: 2, sound: 'breath.wav' },
        { freq: 140, message: '茶馆喝茶喝多，肠胃有点受不了', damage: 1, sound: 'breath.wav' },
        { freq: 90, message: '春季西湖游玩，受凉感冒', damage: 2, sound: 'breath.wav', tags: ['spring'] },
        { freq: 100, message: '互联网加班，身体疲惫', damage: 1, sound: 'breath.wav' },
        { freq: 85, message: '千岛湖游泳，中暑了', damage: 2, sound: 'breath.wav', tags: ['summer'] }
      ],
      // 金钱事件
      [
        { freq: 80, message: '西湖边消费，临时开销', cashMultiplier: 15 },
        { freq: 100, message: '龙井茶买贵了，后悔了', cashMultiplier: 10 },
        { freq: 70, message: '阿里园区咖啡，日常消费', cashMultiplier: 12 },
        { freq: 90, message: '宋城演出票，娱乐消费', cashMultiplier: 20 },
        { freq: 60, message: '千岛湖度假，旅游开销', cashMultiplier: 25 },
        { freq: 85, message: '买了假冒茶叶，退货损失', cashMultiplier: 8 }
      ]
    )
  }
}


// 杭州交通策略 - 江南水城交通
export class HangzhouTransportationStrategy extends BaseTransportationStrategy {
  constructor() {
    super(
      {
        'beijing': 400,   // 杭州东到北京南高铁约350-550元
        'shanghai': 55,   // 杭州东到上海虹桥高铁约50-80元
        'guangzhou': 550, // 杭州东到广州南高铁约450-650元
        'shenzhen': 550,  // 杭州东到深圳北高铁约450-650元
        'suzhou': 45,     // 杭州东到苏州北高铁约40-60元
        'tianjin': 450,   // 杭州东到天津西高铁约350-550元
        'qingdao': 400    // 杭州东到青岛高铁约300-500元
      },
      {
        'beijing': 1200,  // 杭州萧山机场到北京首都机场约1000-1400元
        'shanghai': 600,  // 杭州萧山机场到上海浦东约400-800元
        'guangzhou': 1200,// 杭州萧山机场到广州白云约1000-1400元
        'shenzhen': 1200, // 杭州萧山机场到深圳宝安约1000-1400元
        'suzhou': 700,    // 杭州萧山机场到南京禄口约500-900元
        'tianjin': 1100,  // 杭州萧山机场到天津滨海约900-1300元
        'qingdao': 800    // 杭州萧山机场到青岛流亭约600-1000元
      },
      3 // 杭州地铁起步价2元，平均3元
    )
  }
}


// 杭州租金策略 - 二线城市适中房价
export class HangzhouRentStrategy extends BaseRentStrategy {
  constructor() {
    super(3500, 380) // 月租3500元，酒店380元/天
  }
}
