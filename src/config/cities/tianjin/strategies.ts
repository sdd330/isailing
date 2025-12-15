// 天津城市策略实现
import {
  BasePriceStrategy, BaseEventStrategy, BaseTransportationStrategy, BaseRentStrategy
} from '../../ConfigManager'


// 天津价格策略 - 冬季取暖上涨
export class TianjinPriceStrategy extends BasePriceStrategy {
  calculatePrice(basePrice: number, priceRange: number, currentWeek?: number): number {
    const base = super.calculatePrice(basePrice, priceRange, currentWeek)
    const week = currentWeek || 1

    // 冬季取暖季节（第40-4周）价格上涨
    if (week >= 40 || week <= 4) {
      const winterHeatingMultiplier = 1.2 + Math.random() * 0.1
      return Math.round(base * winterHeatingMultiplier)
    }

    return base
  }
}


// 天津事件策略 - 海河港口，天津卫文化，北方美食之都
export class TianjinEventStrategy extends BaseEventStrategy {
  constructor() {
    super(
      // 商业事件
      [
        { freq: 150, message: '天津港贸易旺季，进口商品价格×2', goodsId: 600000, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 110, message: '古文化街，天津卫工艺品价格×3', goodsId: 600001, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 95, message: '海河游船，旅游纪念品价格×2', goodsId: 600002, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 80, message: '天津卫话书籍，文化用品价格×2', goodsId: 600003, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 70, message: '杨柳青木版年画，艺术品价格×3', goodsId: 600004, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
        { freq: 85, message: '滨海新区，高端商品价格×2', goodsId: 600005, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 60, message: '天津站，旅行用品价格×2', goodsId: 600006, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 90, message: '鼓楼商圈，时尚用品价格×2', goodsId: 600007, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 75, message: '南市食品街，美食礼盒价格×2', goodsId: 600008, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
        { freq: 65, message: '塘沽码头，海鲜礼盒价格×2', goodsId: 600009, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 }
      ],
      // 健康事件
      [
        { freq: 120, message: '海河边海风大，头晕感冒', damage: 2, sound: 'breath.wav' },
        { freq: 140, message: '天津卫饮食重口，肠胃不适', damage: 1, sound: 'breath.wav' },
        { freq: 90, message: '冬季取暖，室内干燥', damage: 2, sound: 'breath.wav', tags: ['winter'] },
        { freq: 100, message: '春季风沙，呼吸道不适', damage: 1, sound: 'breath.wav', tags: ['spring'] },
        { freq: 85, message: '夏日海边，紫外线强', damage: 1, sound: 'breath.wav', tags: ['summer'] }
      ],
      // 金钱事件
      [
        { freq: 80, message: '古文化街消费，文化开销', cashMultiplier: 18 },
        { freq: 100, message: '海河游船，娱乐消费', cashMultiplier: 22 },
        { freq: 70, message: '天津卫书籍，文化投资', cashMultiplier: 15 },
        { freq: 90, message: '杨柳青年画，艺术收藏', cashMultiplier: 25 },
        { freq: 60, message: '滨海新区购物，高档消费', cashMultiplier: 30 },
        { freq: 85, message: '买了假冒卫嘴子，退货损失', cashMultiplier: 12 }
      ]
    )
  }
}


// 天津交通策略 - 海河港口交通
export class TianjinTransportationStrategy extends BaseTransportationStrategy {
  constructor() {
    super(
      {
        'beijing': 55,    // 天津西到北京南高铁约50-80元
        'shanghai': 400,  // 天津西到上海虹桥高铁约350-550元
        'guangzhou': 650, // 天津西到广州南高铁约550-750元
        'shenzhen': 600,  // 天津西到深圳北高铁约500-700元
        'hangzhou': 450,  // 天津西到杭州东高铁约350-550元
        'suzhou': 350,    // 天津西到苏州北高铁约300-500元
        'qingdao': 200    // 天津西到青岛高铁约150-250元
      },
      {
        'beijing': 300,   // 天津滨海机场到北京首都机场约200-400元
        'shanghai': 1200, // 天津滨海机场到上海浦东约1000-1400元
        'guangzhou': 1500,// 天津滨海机场到广州白云约1300-1700元
        'shenzhen': 1300, // 天津滨海机场到深圳宝安约1100-1500元
        'hangzhou': 1100, // 天津滨海机场到杭州萧山约900-1300元
        'suzhou': 1200,   // 天津滨海机场到南京禄口约1000-1400元
        'qingdao': 400    // 天津滨海机场到青岛流亭约300-500元
      },
      3 // 天津地铁起步价2元，平均3元
    )
  }
}


// 天津租金策略 - 北方港口城市房价
export class TianjinRentStrategy extends BaseRentStrategy {
  constructor() {
    super(2400, 280) // 月租2400元，酒店280元/天
  }
}
