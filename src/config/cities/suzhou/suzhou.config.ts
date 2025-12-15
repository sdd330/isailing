import { CityConfig } from '../../ConfigManager'
import type { BuildingConfig, PriceStrategy, EventStrategy, TransportationStrategy, RentStrategy } from '../../ConfigManager'
import {
  SuzhouPriceStrategy,
  SuzhouEventStrategy,
  SuzhouTransportationStrategy,
  SuzhouRentStrategy
} from './strategies'
import { CITY_ID_MAP } from '../../city-id'
import type { GoodsDefinition, LocationDefinition } from '@/types/game'

// 苏州城市配置 - 姑苏特色：江南水城，园林之城，手工艺品中心
export class SuzhouCityConfig extends CityConfig {
  private locations: LocationDefinition[] = [
    { id: 0, name: '观前街', description: '苏州古城核心商圈' },
    { id: 1, name: '金鸡湖', description: '金鸡湖CBD，现代商务区' },
    { id: 2, name: '拙政园', description: '拙政园，世界文化遗产' },
    { id: 3, name: '山塘街', description: '山塘古街，小商品云集' },
    { id: 4, name: '苏州火车站', description: '苏州站，交通枢纽', isTrainStation: true },
    { id: 5, name: '园区湖东', description: '苏州工业园区，白领聚集地' },
    { id: 6, name: '石路', description: '老牌商业街区' },
    { id: 7, name: '观山路', description: '高新区科技园' },
    { id: 8, name: '诚品书店', description: '文艺青年聚集地' },
    { id: 9, name: '同里古镇', description: '水乡古镇，游客如织' },
    {
      id: 10,
      name: '花桥站',
      description: '沪苏轨交互通枢纽，可通过此处直接前往上海',
      hasMarket: true,
      intercityTunnel: {
        targetCity: '上海',
        type: 'train'
      }
    }
  ]

  private goods: GoodsDefinition[] = [
    { id: 500000, name: '苏式糖果', basePrice: 60, priceRange: 200 },
    { id: 500001, name: '真丝旗袍', basePrice: 800, priceRange: 1500 },
    { id: 500002, name: '园林门票代售', basePrice: 120, priceRange: 300 },
    { id: 500003, name: '手工刺绣', basePrice: 300, priceRange: 1200 },
    { id: 500004, name: '茶点礼盒', basePrice: 180, priceRange: 600 },
    { id: 500005, name: '小众首饰', basePrice: 200, priceRange: 500 },
    { id: 500006, name: '摄影代拍服务', basePrice: 400, priceRange: 800 },
    { id: 500007, name: '仿古摆件', basePrice: 150, priceRange: 400 }
  ]

  private buildings: BuildingConfig = {
    bank: { name: '银行', icon: '🏦' },
    hospital: {
      name: '医院',
      icon: '🏥',
      costPerPoint: 320,
      triggerHealth: 85
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
          description: '在工业园区工地打工，收入较高',
          incomeRange: [260, 460],
          staminaCostRange: [8, 15]
        },
        {
          id: 'delivery',
          name: '送外卖',
          icon: '🛵',
          description: '为园区白领送外卖，需要押金，收入中等',
          incomeRange: [9, 42],
          staminaCostRange: [5, 10],
          cost: 13,
          dailyLimit: 4
        },
        {
          id: 'warehouse',
          name: '仓库搬运',
          icon: '📦',
          description: '在物流园区搬运货物，收入中等',
          incomeRange: [190, 370],
          staminaCostRange: [6, 12]
        },
        {
          id: 'restaurant',
          name: '餐厅服务员',
          icon: '🍽️',
          description: '在观前街餐厅当服务员，收入较低',
          incomeRange: [140, 270],
          staminaCostRange: [4, 8]
        },
        {
          id: 'cleaning',
          name: '清洁工',
          icon: '🧹',
          description: '在写字楼做清洁工作，收入最低',
          incomeRange: [100, 230],
          staminaCostRange: [3, 7]
        },
        {
          id: 'craft',
          name: '手工艺人',
          icon: '🎨',
          description: '制作手工艺品出售，收入中等但需要技能',
          incomeRange: [180, 350],
          staminaCostRange: [4, 9]
        },
        {
          id: 'tourguide',
          name: '导游',
          icon: '🎫',
          description: '在园林当导游，收入较高',
          incomeRange: [210, 390],
          staminaCostRange: [5, 10]
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
          cost: 2500,
          monthlyRent: 2500,
          capacityIncrease: 20
        },
        {
          id: 'one-bedroom',
          name: '两室一厅',
          icon: '🏠',
          description: '两室一厅',
          cost: 4500,
          monthlyRent: 4500,
          capacityIncrease: 40,
          discountThreshold: 30000
        },
        {
          id: 'three-bedroom',
          name: '三室两厅',
          icon: '🏡',
          description: '三室两厅',
          cost: 8000,
          monthlyRent: 8000,
          capacityIncrease: 60,
          discountThreshold: 50000
        },
        {
          id: 'luxury',
          name: '豪华公寓',
          icon: '🏰',
          description: '豪华公寓',
          cost: 12000,
          monthlyRent: 12000,
          capacityIncrease: 80,
          discountThreshold: 80000
        }
      ]
    },
    subway: {
      name: '地铁',
      icon: '🚇',
      description: '乘坐地铁出行'
    },
    airport: {
      name: '虹桥机场',
      icon: '✈️',
      description: '从上海虹桥机场中转前往其他城市'
    },
    trainStation: {
      name: '苏州火车站',
      icon: '🚄',
      description: '从苏州火车站乘高铁前往其他城市'
    }
  }

  private priceStrategy = new SuzhouPriceStrategy()
  private eventStrategy = new SuzhouEventStrategy()
  private transportationStrategy = new SuzhouTransportationStrategy()
  private rentStrategy = new SuzhouRentStrategy()

  constructor() {
    super(
      CITY_ID_MAP['苏州'] ?? 5,
      '苏州',
      '苏',
      '姑苏苏州，江南水城，园林之城，手工艺品中心，东方威尼斯',
      [
        '江南水城：古运河、小桥流水、苏州园林',
        '园林之城：拙政园、狮子林、私家园林众多',
        '工艺中心：真丝旗袍、手工刺绣、苏式工艺品',
        '文化古都：吴文化、昆曲艺术、书香门第',
        '经济发达：苏州工业园区、高新技术产业',
        '生活精致：慢节奏生活、美食文化、宜居环境'
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

// 导出苏州城市配置实例
export const suzhouConfig = new SuzhouCityConfig()