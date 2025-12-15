import type { LocationDefinition, GoodsDefinition } from '@/types/game'
import { CityConfig } from '../../ConfigManager'
import type { BuildingConfig, PriceStrategy, EventStrategy, TransportationStrategy, RentStrategy } from '../../ConfigManager'
import { CITY_ID_MAP } from '../../city-id'
import {
  GuangzhouPriceStrategy,
  GuangzhouEventStrategy,
  GuangzhouTransportationStrategy,
  GuangzhouRentStrategy
} from './strategies'

// 广州城市配置 - 南方特色：亚热带气候，美食之都，广交会中心
export class GuangzhouCityConfig extends CityConfig {
  private locations: LocationDefinition[] = [
    { id: 0, name: "天河城", description: "天河城，商业中心" },
    { id: 1, name: "珠江新城", description: "珠江新城，金融中心" },
    { id: 2, name: "北京路", description: "北京路，传统商业街" },
    { id: 3, name: "上下九", description: "上下九，步行街" },
    { id: 4, name: "体育西路", description: "体育西路，交通枢纽" },
    { id: 5, name: "大学城", description: "大学城，教育区" },
    { id: 6, name: "琶洲", description: "琶洲，会展中心" },
    { id: 7, name: "白云山", description: "白云山，风景区" },
    { id: 8, name: "越秀公园", description: "越秀公园，文化区" },
    { id: 9, name: "沙面", description: "沙面，历史街区" },
    { id: 10, name: "白云机场", description: "白云机场，华南重要航空枢纽", isAirport: true },
    { id: 11, name: "广州站", description: "广州站，高铁交通枢纽", isTrainStation: true }
  ]

  private goods: GoodsDefinition[] = [
    { id: 200000, name: '广式点心', basePrice: 80, priceRange: 200 },
    { id: 200001, name: '进口电子产品', basePrice: 2000, priceRange: 5000 },
    { id: 200002, name: '服装批发', basePrice: 50, priceRange: 300 },
    { id: 200003, name: '茶叶', basePrice: 200, priceRange: 800 },
    { id: 200004, name: '《岭南文化》', basePrice: 4000, priceRange: 8000 },
    { id: 200005, name: '进口水果', basePrice: 150, priceRange: 500 },
    { id: 200006, name: '手机配件', basePrice: 100, priceRange: 400 },
    { id: 200007, name: '中药材', basePrice: 300, priceRange: 1000 },
    { id: 200008, name: 'Labubu摆件', basePrice: 260, priceRange: 900 },
    { id: 200009, name: 'YOYO酱钥匙扣', basePrice: 80, priceRange: 250 }
  ]

  private buildings: BuildingConfig = {
    bank: { name: '银行', icon: '🏦' },
    hospital: {
      name: '医院',
      icon: '🏥',
      costPerPoint: 300,
      triggerHealth: 90
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
          description: '在珠江新城建筑工地打工，收入较高',
          incomeRange: [280, 480],
          staminaCostRange: [8, 15]
        },
        {
          id: 'delivery',
          name: '送外卖',
          icon: '🛵',
          description: '在羊城送外卖，需要押金，收入中等',
          incomeRange: [10, 48],
          staminaCostRange: [5, 10],
          cost: 14,
          dailyLimit: 4
        },
        {
          id: 'warehouse',
          name: '仓库搬运',
          icon: '📦',
          description: '在广交会仓库搬运货物，收入中等',
          incomeRange: [200, 380],
          staminaCostRange: [6, 12]
        },
        {
          id: 'restaurant',
          name: '餐厅服务员',
          icon: '🍽️',
          description: '在上下九餐厅当服务员，收入较低',
          incomeRange: [140, 280],
          staminaCostRange: [4, 8]
        },
        {
          id: 'cleaning',
          name: '清洁工',
          icon: '🧹',
          description: '在写字楼做清洁工作，收入最低',
          incomeRange: [100, 240],
          staminaCostRange: [3, 7]
        },
        {
          id: 'vendor',
          name: '摆摊',
          icon: '🛒',
          description: '在步行街摆摊卖小商品，收入不稳定但灵活',
          incomeRange: [80, 300],
          staminaCostRange: [4, 9],
          cost: 50
        },
        {
          id: 'trade',
          name: '贸易助理',
          icon: '📊',
          description: '在广交会当贸易助理，收入较高但需要技能',
          incomeRange: [220, 400],
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
      name: '白云机场',
      icon: '✈️',
      description: '从白云机场乘飞机前往其他城市'
    },
    trainStation: {
      name: '广州站',
      icon: '🚄',
      description: '从广州站乘高铁前往其他城市'
    }
  }

  private priceStrategy = new GuangzhouPriceStrategy()
  private eventStrategy = new GuangzhouEventStrategy()
  private transportationStrategy = new GuangzhouTransportationStrategy()
  private rentStrategy = new GuangzhouRentStrategy()

  constructor() {
    super(
      CITY_ID_MAP['广州'] ?? 2,
      '广州',
      '穗',
      '羊城广州，亚热带气候，美食之都，广交会中心，华南经济重镇',
      [
        '亚热带气候：昼夜温差大、高温潮湿、空调病多发',
        '美食天堂：肠胃不适、粤菜吃多、各种特色小吃',
        '广交会中心：国际贸易、商品博览、商业繁荣',
        '文化多元：西关文化、岭南建筑、华南风情',
        '经济发达：华南地区中心、金融服务业强',
        '交通便利：白云机场、高铁枢纽、四通八达'
      ]
    )
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

  getLocations(): LocationDefinition[] {
    return this.locations
  }

  getGoods(): GoodsDefinition[] {
    return this.goods
  }

  getBuildings(): BuildingConfig {
    return this.buildings
  }
}

// 导出广州城市配置实例
export const guangzhouConfig = new GuangzhouCityConfig()

