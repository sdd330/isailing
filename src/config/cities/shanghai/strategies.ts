// 上海城市策略实现
import {
  BasePriceStrategy, BaseEventStrategy, BaseTransportationStrategy, BaseRentStrategy
} from '../../ConfigManager'


// 上海价格策略 - 节日促销打折
export class ShanghaiPriceStrategy extends BasePriceStrategy {
  calculatePrice(basePrice: number, priceRange: number, currentWeek?: number): number {
    const base = super.calculatePrice(basePrice, priceRange, currentWeek)
    const week = currentWeek || 1

    // 双十一购物节（第45周前后）打折
    if (week >= 43 && week <= 47) {
      const discount = 0.7 + Math.random() * 0.2 // 7-9折
      return Math.round(base * discount)
    }

    return base
  }
}


// 上海事件策略 - 快节奏生活，加班熬夜、996工作制、雾霾呼吸不适
export class ShanghaiEventStrategy extends BaseEventStrategy {
  constructor() {
    super(
      // 商业事件
      [
        { freq: 150, message: '外滩夜景灯光秀，旅游纪念品价格×3', goodsId: 100004, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 110, message: '陆家嘴CBD高峰，商务正装价格×2', goodsId: 100001, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 95, message: '新天地酒吧街，潮流手办价格×2', goodsId: 100002, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 80, message: '南京路步行街，化妆品价格×2', goodsId: 100007, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 70, message: '豫园商城，传统工艺品价格×3', goodsId: 100003, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 85, message: '徐家汇商圈，电子产品价格×2', goodsId: 100006, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 60, message: '田子坊创意园区，艺术品价格×3', goodsId: 100008, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 90, message: '静安寺庙会，小商品价格×2', goodsId: 100005, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 75, message: '五角场大学城，游戏点卡价格×2', goodsId: 100000, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 65, message: '虹桥火车站，旅行用品价格×2', goodsId: 100009, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        // 情人节：外滩浪漫
        { freq: 32, message: '情人节外滩散步，进口香烟价格×2', goodsId: 100000, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0, tags: ['情人节'] },
        // 三八妇女节：化妆品热销
        { freq: 34, message: '三八女神节，化妆品促销价格÷2', goodsId: 100007, priceMultiplier: 0, priceDivider: 2, goodsGiven: 0, tags: ['三八'] },
        // 五一：旅游高峰
        { freq: 30, message: '五一假期，南京路人满，导游服务价格×3', goodsId: 100004, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0, tags: ['五一'] },
        // 端午：粽子节
        { freq: 28, message: '端午节，粽子礼盒价格×2', goodsId: 100003, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0, tags: ['端午'] },
        // 中秋：月饼热销
        { freq: 30, message: '中秋节月饼礼盒价格×3', goodsId: 100004, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0, tags: ['中秋'] },
        // 圣诞：商场促销
        { freq: 32, message: '圣诞节徐家汇商场，电子产品价格÷2', goodsId: 100006, priceMultiplier: 0, priceDivider: 2, goodsGiven: 0, tags: ['圣诞'] },
        // 元旦：新年购物
        { freq: 32, message: '元旦新年，潮流手办价格×2', goodsId: 100002, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0, tags: ['元旦'] }
      ],
      // 健康事件
      [
        { freq: 180, message: '加班到凌晨，身体疲惫不堪', damage: 3, sound: 'breath.wav' },
        { freq: 140, message: '996工作制，长期熬夜', damage: 2, sound: 'breath.wav' },
        { freq: 120, message: '雾霾天持续，呼吸不适', damage: 2, sound: 'breath.wav' },
        { freq: 100, message: '快节奏生活，精神紧张', damage: 1, sound: 'breath.wav' },
        { freq: 90, message: '黄梅天潮湿，关节疼痛', damage: 2, sound: 'breath.wav', tags: ['梅雨'] },
        { freq: 85, message: '空调病频发，头晕乏力', damage: 1, sound: 'breath.wav', tags: ['summer'] }
      ],
      // 金钱事件
      [
        { freq: 80, message: '加班打车，临时消费增加', cashMultiplier: 15 },
        { freq: 100, message: '外滩消费太高，钱包大出血', cashMultiplier: 25 },
        { freq: 70, message: '新天地酒吧消费，临时开销', cashMultiplier: 20 },
        { freq: 90, message: '徐家汇购物，信用卡刷爆', cashMultiplier: 30 },
        { freq: 60, message: '虹桥高铁临时改签，额外费用', cashMultiplier: 10 },
        { freq: 85, message: '买了假冒奢侈品，退货损失', cashMultiplier: 8 }
      ]
    )
  }
}


// 上海交通策略 - 国际大都市交通
export class ShanghaiTransportationStrategy extends BaseTransportationStrategy {
  constructor() {
    super(
      {
        'beijing': 450,    // 上海虹桥到北京西高铁约350-550元
        'guangzhou': 550,  // 上海虹桥到广州南高铁约450-650元
        'shenzhen': 500,   // 上海虹桥到深圳北高铁约400-600元
        'hangzhou': 55,    // 上海虹桥到杭州东高铁约50-80元
        'suzhou': 35,      // 上海虹桥到苏州北高铁约30-50元
        'tianjin': 400,    // 上海虹桥到天津西高铁约350-550元
        'qingdao': 450     // 上海虹桥到青岛高铁约350-550元
      },
      {
        'beijing': 1200,   // 上海浦东/虹桥到北京首都机场约1000-1500元
        'guangzhou': 1500, // 上海到广州白云机场约1200-1600元
        'shenzhen': 1400,  // 上海到深圳宝安机场约1200-1600元
        'hangzhou': 600,   // 上海到杭州萧山机场约400-800元
        'suzhou': 800,     // 上海到南京禄口机场约600-1000元（苏州无机场）
        'tianjin': 1200,   // 上海到天津滨海机场约1000-1400元
        'qingdao': 1000    // 上海到青岛流亭机场约800-1200元
      },
      4 // 上海地铁起步价2元，平均4元
    )
  }
}


// 上海租金策略 - 高房价城市
export class ShanghaiRentStrategy extends BaseRentStrategy {
  constructor() {
    super(5500, 450) // 月租5500元，酒店450元/天
  }
}
