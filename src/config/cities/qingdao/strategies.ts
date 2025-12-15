// 青岛城市策略实现
import {
  BasePriceStrategy, BaseEventStrategy, BaseTransportationStrategy, BaseRentStrategy
} from '../../ConfigManager'


// 青岛价格策略 - 夏季旅游旺季
export class QingdaoPriceStrategy extends BasePriceStrategy {
  calculatePrice(basePrice: number, priceRange: number, currentWeek?: number): number {
    const base = super.calculatePrice(basePrice, priceRange, currentWeek)
    const week = currentWeek || 1

    // 夏季旅游旺季（第22-30周）价格上涨
    if (week >= 22 && week <= 30) {
      const summerTourismMultiplier = 1.5 + Math.random() * 0.3
      return Math.round(base * summerTourismMultiplier)
    }

    return base
  }
}


// 青岛事件策略 - 海滨旅游，啤酒之都，红瓦绿树魅力城市
export class QingdaoEventStrategy extends BaseEventStrategy {
  constructor() {
    super(
      // 商业事件
      [
        { freq: 150, message: '青岛啤酒节开幕，啤酒价格×3', goodsId: 700009, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 110, message: '栈桥旅游旺季，纪念品价格×2', goodsId: 700000, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 95, message: '八大关景区，摄影服务价格×2', goodsId: 700001, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 80, message: '崂山风景区，登山装备价格×2', goodsId: 700002, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 70, message: '台东夜市，海鲜礼盒价格×3', goodsId: 700003, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 85, message: '奥帆中心，帆船用品价格×2', goodsId: 700004, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 60, message: '红瓦绿树建筑，文化纪念品价格×2', goodsId: 700005, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 90, message: '青岛机场，旅行用品价格×2', goodsId: 700006, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 75, message: '劈柴院历史街区，手工艺品价格×2', goodsId: 700007, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 65, message: '信号山公园，户外装备价格×2', goodsId: 700008, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 }
      ],
      // 健康事件
      [
        { freq: 120, message: '海鲜过敏，肠胃不适', damage: 2, sound: 'breath.wav' },
        { freq: 140, message: '海边紫外线强，晒伤了', damage: 1, sound: 'breath.wav' },
        { freq: 90, message: '啤酒节饮酒过量，头疼', damage: 2, sound: 'breath.wav' },
        { freq: 100, message: '海风大，感冒频发', damage: 1, sound: 'breath.wav' },
        { freq: 85, message: '夏季海边游泳，中暑', damage: 1, sound: 'breath.wav', tags: ['summer'] }
      ],
      // 金钱事件
      [
        { freq: 80, message: '栈桥消费，旅游开销', cashMultiplier: 20 },
        { freq: 100, message: '啤酒节狂欢，消费过高', cashMultiplier: 25 },
        { freq: 70, message: '海鲜大餐，美食消费', cashMultiplier: 18 },
        { freq: 90, message: '八大关拍照，临时消费', cashMultiplier: 15 },
        { freq: 60, message: '崂山登山，装备开销', cashMultiplier: 22 },
        { freq: 85, message: '买了假冒青岛啤酒，退货损失', cashMultiplier: 10 }
      ]
    )
  }
}


// 青岛交通策略 - 海滨旅游城市交通
export class QingdaoTransportationStrategy extends BaseTransportationStrategy {
  constructor() {
    super(
      {
        'beijing': 450,   // 青岛到北京南高铁约350-550元
        'shanghai': 450,  // 青岛到上海虹桥高铁约350-550元
        'guangzhou': 700, // 青岛到广州南高铁约600-800元
        'shenzhen': 650,  // 青岛到深圳北高铁约550-750元
        'hangzhou': 400,  // 青岛到杭州东高铁约300-500元
        'suzhou': 400,    // 青岛到苏州北高铁约300-500元
        'tianjin': 200    // 青岛到天津西高铁约150-250元
      },
      {
        'beijing': 1000,  // 青岛流亭机场到北京首都机场约800-1200元
        'shanghai': 1000, // 青岛流亭机场到上海浦东约800-1200元
        'guangzhou': 1200,// 青岛流亭机场到广州白云约1000-1400元
        'shenzhen': 1000, // 青岛流亭机场到深圳宝安约800-1200元
        'hangzhou': 800,  // 青岛流亭机场到杭州萧山约600-1000元
        'suzhou': 1000,   // 青岛流亭机场到南京禄口约800-1200元
        'tianjin': 400    // 青岛流亭机场到天津滨海约300-500元
      },
      3 // 青岛地铁起步价2元，平均3元
    )
  }
}


// 青岛租金策略 - 海滨旅游城市房价
export class QingdaoRentStrategy extends BaseRentStrategy {
  constructor() {
    super(2400, 250) // 月租2400元，酒店250元/天
  }
}
