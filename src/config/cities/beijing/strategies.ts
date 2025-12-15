/**
 * 北京城市策略实现
 * 包含价格、事件、交通、租金等策略的具体实现
 */
import {
  BasePriceStrategy,
  BaseEventStrategy,
  BaseTransportationStrategy,
  BaseRentStrategy,
  EventFactory
} from '../../ConfigManager'
// 北京价格策略 - 春季沙尘暴上涨
export class BeijingPriceStrategy extends BasePriceStrategy {
  calculatePrice(basePrice: number, priceRange: number, currentWeek?: number): number {
    const base = super.calculatePrice(basePrice, priceRange, currentWeek)
    const week = currentWeek || 1

    // 春季（第5-15周）沙尘暴影响，价格上涨10-20%
    if (week >= 5 && week <= 15) {
      const sandstormMultiplier = 1.1 + Math.random() * 0.1
      return Math.round(base * sandstormMultiplier)
    }

    return base
  }
}


// 北京事件策略 - 空气污染严重，PM2.5爆表、沙尘暴席卷京城
export class BeijingEventStrategy extends BaseEventStrategy {
  constructor() {
    super(
      // 商业事件 - 空气污染相关商品需求增加
      [
        EventFactory.createCommercialEvent(150, '空气污染严重，口罩需求暴增，口罩价格×2', 0, 2),
        EventFactory.createCommercialEvent(110, '沙尘暴来袭，空气净化器销量大增，价格×3', 1, 3),
        EventFactory.createCommercialEvent(95, '雾霾天持续，雾化器热销，价格×2', 2, 2),
        EventFactory.createCommercialEvent(80, '春节将至，烟酒需求增加，进口香烟价格×2', 3, 2),
        EventFactory.createCommercialEvent(70, '胡同游热，导游服务价格×2', 4, 2),
        EventFactory.createCommercialEvent(85, '故宫门票紧俏，代购价格×3', 5, 3),
        EventFactory.createCommercialEvent(60, '长城旅游旺季，旅行用品价格×2', 6, 2),
        EventFactory.createCommercialEvent(90, '冬奥会纪念品热销，手办价格×2', 7, 2),
        EventFactory.createCommercialEvent(75, '京剧演出火爆，戏票代购价格×2', 8, 2),
        EventFactory.createCommercialEvent(65, '798艺术区展览，艺术品价格×3', 9, 3),
        // 节日特供事件
        EventFactory.createCommercialEvent(25, '春节烟花爆竹热销，但受污染影响需求下降，价格÷2', 3, 0, 2, ['春节']),
        EventFactory.createCommercialEvent(30, '清明节祭祖，冥纸冥币价格×2', 4, 2, 0, ['清明']),
        EventFactory.createCommercialEvent(35, '五一黄金周，天安门广场人满，导游服务价格×3', 4, 3, 0, ['五一']),
        EventFactory.createCommercialEvent(40, '国庆阅兵，观看票代购价格×5', 5, 5, 0, ['国庆']),
        EventFactory.createCommercialEvent(28, '冬至吃饺子，猪肉馅价格×2', 3, 2, 0, ['冬至'])
      ],
      // 健康事件 - 空气污染导致的健康问题
      [
        EventFactory.createHealthEvent(180, 'PM2.5爆表，呼吸困难', 3, 'breath.wav'),
        EventFactory.createHealthEvent(140, '沙尘暴席卷京城，眼睛刺痛', 2, 'breath.wav'),
        EventFactory.createHealthEvent(120, '雾霾天持续，咳嗽不止', 2, 'breath.wav'),
        EventFactory.createHealthEvent(100, '空气污染严重，头晕乏力', 1, 'breath.wav'),
        EventFactory.createHealthEvent(90, '春季过敏，花粉症发作', 2, 'breath.wav', ['spring']),
        EventFactory.createHealthEvent(85, '冬季供暖，室内空气干燥', 1, 'breath.wav', ['winter'])
      ],
      // 金钱事件 - 污染相关的经济损失
      [
        EventFactory.createMoneyEvent(80, '雾霾天开车，能见度低，违章罚款', 10),
        EventFactory.createMoneyEvent(100, '胡同追逐游戏，手机摔坏', 8),
        EventFactory.createMoneyEvent(70, '故宫门票涨价，临时消费增加', 15),
        EventFactory.createMoneyEvent(90, '空气净化器坏了，紧急更换', 25),
        EventFactory.createMoneyEvent(60, '雾霾天打不到车，改乘高铁损失', 20),
        EventFactory.createMoneyEvent(85, '买了假冒口罩，退货损失', 5)
      ]
    )
  }
}


// 北京交通策略 - 首都交通枢纽
export class BeijingTransportationStrategy extends BaseTransportationStrategy {
  constructor() {
    super(
      {
        'shanghai': 450,    // 北京西到上海虹桥高铁约350-550元，取中间值
        'guangzhou': 550,   // 北京西到广州南高铁约450-650元
        'shenzhen': 500,    // 北京西到深圳北高铁约400-600元
        'hangzhou': 400,    // 北京南到杭州东高铁约350-550元
        'suzhou': 350,      // 北京南到苏州北高铁约300-500元
        'tianjin': 55,      // 北京南到天津西高铁约50-80元
        'qingdao': 450      // 北京南到青岛高铁约350-550元
      },
      {
        'shanghai': 1200,   // 北京首都机场到上海浦东约1000-1500元
        'guangzhou': 1500,  // 北京到广州白云机场约1200-1600元
        'shenzhen': 1400,   // 北京到深圳宝安机场约1200-1600元
        'hangzhou': 1200,   // 北京到杭州萧山机场约1000-1400元
        'suzhou': 1300,     // 北京到上海机场（苏州无机场）约1200-1600元
        'tianjin': 300,     // 北京到天津滨海机场约200-400元
        'qingdao': 1000     // 北京到青岛流亭机场约800-1200元
      },
      3 // 北京地铁起步价2元，平均3元
    )
  }
}


// 北京租金策略 - 全国最高房价
export class BeijingRentStrategy extends BaseRentStrategy {
  constructor() {
    super(5000, 450) // 月租5000元，酒店450元/天
  }
}
