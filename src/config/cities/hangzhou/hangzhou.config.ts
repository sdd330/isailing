import type { LocationDefinition, GoodsDefinition } from '@/types/game'
import { CityConfig } from '../../ConfigManager'
import type { BuildingConfig, PriceStrategy, EventStrategy, TransportationStrategy, RentStrategy } from '../../ConfigManager'
import { CITY_ID_MAP } from '../../city-id'
import {
  HangzhouPriceStrategy,
  HangzhouEventStrategy,
  HangzhouTransportationStrategy,
  HangzhouRentStrategy
} from './strategies'

// 杭州城市配置 - 西湖特色：互联网小镇，人间天堂，生活节奏适中
export class HangzhouCityConfig extends CityConfig {
  private locations: LocationDefinition[] = [
    { id: 0, name: '西湖', description: '西湖景区，游客众多' },
    { id: 1, name: '灵隐寺', description: '灵隐寺，香火鼎盛' },
    { id: 2, name: '钱江新城', description: '钱江新城，金融商务区' },
    { id: 3, name: '城站', description: '杭州城站火车站，交通枢纽', isTrainStation: true },
    { id: 4, name: '武林广场', description: '武林广场，传统商圈' },
    { id: 5, name: '滨江', description: '滨江，高新区互联网公司云集' },
    { id: 6, name: '文三路', description: '文三路，电子数码一条街' },
    { id: 7, name: '河坊街', description: '河坊街，老杭州小商品集散地' },
    { id: 8, name: '龙井村', description: '龙井村，龙井茶核心产区' },
    { id: 9, name: '阿里园区', description: '阿里巴巴园区，互联网大厂圣地' },
    { id: 10, name: '杭州东站', description: '杭州东站，高铁交通枢纽', isTrainStation: true },
    { id: 11, name: '萧山机场', description: '萧山国际机场，长三角重要航空枢纽', isAirport: true }
  ]

  private goods: GoodsDefinition[] = [
    { id: 400000, name: '西湖龙井', basePrice: 220, priceRange: 800 },
    { id: 400001, name: '互联网理财产品', basePrice: 500, priceRange: 2500 },
    { id: 400002, name: '高仿丝绸', basePrice: 150, priceRange: 600 },
    { id: 400003, name: '电动平衡车', basePrice: 1200, priceRange: 3000 },
    { id: 400004, name: '文创雨伞', basePrice: 90, priceRange: 260 },
    { id: 400005, name: '电竞外设', basePrice: 350, priceRange: 1200 },
    { id: 400006, name: '网红奶茶粉', basePrice: 60, priceRange: 200 },
    { id: 400007, name: '伪劣养生保健品', basePrice: 80, priceRange: 250 }
  ]

  private buildings: BuildingConfig = {
    bank: { name: '银行', icon: '🏦' },
    hospital: {
      name: '医院',
      icon: '🏥',
      costPerPoint: 300,
      triggerHealth: 80
    },
    constructionSite: {
      name: '打工',
      icon: '💼',
      description: '选择工作类型赚取收入',
      workTypes: [
        {
          id: 'construction',
          name: '建筑工地',
          icon: '🏗️',
          description: '在钱江新城工地打工，收入较高',
          incomeRange: [250, 450],
          staminaCostRange: [8, 15]
        },
        {
          id: 'delivery',
          name: '送外卖',
          icon: '🛵',
          description: '为园区白领送外卖，需要押金，收入中等',
          incomeRange: [8, 40],
          staminaCostRange: [5, 10],
          cost: 12,
          dailyLimit: 4
        },
        {
          id: 'warehouse',
          name: '仓库搬运',
          icon: '📦',
          description: '在物流园区搬运货物，收入中等',
          incomeRange: [180, 360],
          staminaCostRange: [6, 12]
        },
        {
          id: 'restaurant',
          name: '餐厅服务员',
          icon: '🍽️',
          description: '在河坊街餐厅当服务员，收入较低',
          incomeRange: [130, 260],
          staminaCostRange: [4, 8]
        },
        {
          id: 'cleaning',
          name: '清洁工',
          icon: '🧹',
          description: '在写字楼做清洁工作，收入最低',
          incomeRange: [90, 220],
          staminaCostRange: [3, 7]
        },
        {
          id: 'tourguide',
          name: '导游',
          icon: '🎫',
          description: '在西湖当导游，收入较高但需要技能',
          incomeRange: [200, 380],
          staminaCostRange: [5, 10]
        },
        {
          id: 'internet',
          name: '互联网兼职',
          icon: '💻',
          description: '在滨江互联网公司做兼职，收入较高',
          incomeRange: [220, 400],
          staminaCostRange: [4, 9]
        }
      ]
    },
    postOffice: {
      name: '邮局',
      icon: '📬',
      description: '偿还债务'
    },
    house: {
      name: '中介',
      icon: '🏠',
      description: '通过中介租房',
      houseTypes: [
        {
          id: 'studio',
          name: '一室一厅',
          icon: '🏘️',
          description: '一室一厅',
          cost: 3500,
          monthlyRent: 3500,
          capacityIncrease: 20
        },
        {
          id: 'one-bedroom',
          name: '两室一厅',
          icon: '🏠',
          description: '两室一厅',
          cost: 5500,
          monthlyRent: 5500,
          capacityIncrease: 40,
          discountThreshold: 40000
        },
        {
          id: 'three-bedroom',
          name: '三室两厅',
          icon: '🏡',
          description: '三室两厅',
          cost: 9000,
          monthlyRent: 9000,
          capacityIncrease: 60,
          discountThreshold: 60000
        },
        {
          id: 'luxury',
          name: '豪华公寓',
          icon: '🏰',
          description: '豪华公寓',
          cost: 14000,
          monthlyRent: 14000,
          capacityIncrease: 80,
          discountThreshold: 100000
        }
      ]
    },
    subway: {
      name: '地铁',
      icon: '🚇',
      description: '乘坐地铁出行'
    },
    airport: {
      name: '萧山机场',
      icon: '✈️',
      description: '从萧山机场乘飞机前往其他城市'
    },
    trainStation: {
      name: '杭州东站',
      icon: '🚄',
      description: '从杭州东站乘高铁前往其他城市'
    }
  }

  private priceStrategy = new HangzhouPriceStrategy()
  private eventStrategy = new HangzhouEventStrategy()
  private transportationStrategy = new HangzhouTransportationStrategy()
  private rentStrategy = new HangzhouRentStrategy()

  constructor() {
    super(
      CITY_ID_MAP['杭州'] ?? 4,
      '杭州',
      '杭',
      '西湖杭州，人间天堂，互联网小镇，生活节奏适中，生态宜居城市',
      [
        '人间天堂：西湖美景、灵隐寺庙、山水文化',
        '互联网小镇：阿里总部、创业氛围、科技创新',
        '生活适中：节奏相对慢、压力较小、宜居环境',
        '生态宜居：绿城指数高、空气质量好、环境优美',
        '房价适中：二线城市水平、居住成本合理',
        '文化底蕴：茶文化、丝绸文化、江南水乡特色'
      ]
    )
  }

  getLocations(): LocationDefinition[] {
    return this.locations
  }

  getGoods(): GoodsDefinition[] {
    return this.goods
  }

  getBuildings(): BuildingConfig {
    return this.buildings
  }

  getPriceStrategy(): PriceStrategy {
    return this.priceStrategy
  }

  getEventStrategy(): EventStrategy {
    return this.eventStrategy
  }

  getTransportationStrategy(): TransportationStrategy {
    return this.transportationStrategy
  }

  getRentStrategy(): RentStrategy {
    return this.rentStrategy
  }
}

// 导出杭州城市配置实例
export const hangzhouConfig = new HangzhouCityConfig()