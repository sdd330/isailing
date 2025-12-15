import type { LocationDefinition, GoodsDefinition } from '@/types/game'
import { CityConfig } from '../../ConfigManager'
import type { BuildingConfig, PriceStrategy, EventStrategy, TransportationStrategy, RentStrategy } from '../../ConfigManager'
import { CITY_ID_MAP } from '../../city-id'
import {
  QingdaoPriceStrategy,
  QingdaoEventStrategy,
  QingdaoTransportationStrategy,
  QingdaoRentStrategy
} from './strategies'

// 青岛城市配置 - 岛城特色：海滨旅游，啤酒之都，红瓦绿树魅力城市
export class QingdaoCityConfig extends CityConfig {
  private locations: LocationDefinition[] = [
    { id: 0, name: '五四广场', description: '五四广场，市中心地标' },
    { id: 1, name: '栈桥', description: '栈桥，游客打卡点' },
    { id: 2, name: '八大关', description: '八大关风景区，别墅林立' },
    { id: 3, name: '啤酒街', description: '啤酒街，夜间经济核心' },
    { id: 4, name: '台东步行街', description: '繁华商业街' },
    { id: 5, name: '黄岛区', description: '黄岛开发区，工厂林立' },
    { id: 6, name: '青岛站', description: '青岛火车站，交通枢纽', isTrainStation: true },
    { id: 7, name: '崂山', description: '崂山风景区' },
    { id: 8, name: '奥帆中心', description: '奥帆中心，海滨旅游区' },
    { id: 9, name: '流亭机场', description: '青岛机场，航班往来频繁', isAirport: true }
  ]

  private goods: GoodsDefinition[] = [
    { id: 700000, name: '散装啤酒', basePrice: 60, priceRange: 180 },
    { id: 700001, name: '海鲜礼盒', basePrice: 260, priceRange: 900 },
    { id: 700002, name: '旅游纪念品', basePrice: 80, priceRange: 260 },
    { id: 700003, name: '海边烧烤套餐券', basePrice: 150, priceRange: 400 },
    { id: 700004, name: '假冒海参', basePrice: 300, priceRange: 1200 },
    { id: 700005, name: '冲浪板租赁券', basePrice: 200, priceRange: 700 },
    { id: 700006, name: '海鲜自助代金券', basePrice: 180, priceRange: 500 },
    { id: 700007, name: '防晒用品套装', basePrice: 120, priceRange: 300 },
    { id: 700008, name: '海滨旅游套票', basePrice: 220, priceRange: 700 },
    { id: 700009, name: '啤酒节纪念啤酒', basePrice: 260, priceRange: 800 }
  ]

  private buildings: BuildingConfig = {
    bank: { name: '银行', icon: '🏦' },
    hospital: {
      name: '医院',
      icon: '🏥',
      costPerPoint: 250,
      triggerHealth: 75
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
          description: '在青岛建筑工地打工，收入中等',
          incomeRange: [200, 400],
          staminaCostRange: [8, 15]
        },
        {
          id: 'delivery',
          name: '送外卖',
          icon: '🛵',
          description: '在青岛街头送外卖，需要押金，收入较低',
          incomeRange: [6, 30],
          staminaCostRange: [5, 10],
          cost: 10,
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
          description: '在餐厅当服务员，收入较低',
          incomeRange: [120, 240],
          staminaCostRange: [4, 8]
        },
        {
          id: 'cleaning',
          name: '清洁工',
          icon: '🧹',
          description: '在写字楼做清洁工作，收入最低',
          incomeRange: [80, 200],
          staminaCostRange: [3, 7]
        },
        {
          id: 'fisherman',
          name: '渔民',
          icon: '🎣',
          description: '在码头当渔民，收入中等但需要技能',
          incomeRange: [150, 320],
          staminaCostRange: [5, 11]
        },
        {
          id: 'tourguide',
          name: '导游',
          icon: '🎫',
          description: '在栈桥、八大关当导游，收入中等',
          incomeRange: [160, 300],
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
          cost: 2000,
          monthlyRent: 2000,
          capacityIncrease: 20
        },
        {
          id: 'one-bedroom',
          name: '两室一厅',
          icon: '🏠',
          description: '两室一厅',
          cost: 3500,
          monthlyRent: 3500,
          capacityIncrease: 40,
          discountThreshold: 25000
        },
        {
          id: 'three-bedroom',
          name: '三室两厅',
          icon: '🏡',
          description: '三室两厅',
          cost: 6000,
          monthlyRent: 6000,
          capacityIncrease: 60,
          discountThreshold: 40000
        },
        {
          id: 'luxury',
          name: '豪华公寓',
          icon: '🏰',
          description: '豪华公寓',
          cost: 10000,
          monthlyRent: 10000,
          capacityIncrease: 80,
          discountThreshold: 60000
        }
      ]
    },
    subway: {
      name: '地铁',
      icon: '🚇',
      description: '乘坐地铁出行'
    },
    airport: {
      name: '流亭机场',
      icon: '✈️',
      description: '从流亭机场乘飞机前往其他城市'
    },
    trainStation: {
      name: '青岛站',
      icon: '🚄',
      description: '从青岛站乘高铁前往其他城市'
    }
  }

  private priceStrategy = new QingdaoPriceStrategy()
  private eventStrategy = new QingdaoEventStrategy()
  private transportationStrategy = new QingdaoTransportationStrategy()
  private rentStrategy = new QingdaoRentStrategy()

  constructor() {
    super(
      CITY_ID_MAP['青岛'] ?? 7,
      '青岛',
      '青',
      '岛城青岛，海滨旅游城市，啤酒之都，红瓦绿树魅力城市',
      [
        '海滨旅游：栈桥、八大关、崂山、奥帆中心',
        '啤酒之都：啤酒节、青岛啤酒、海鲜美食',
        '红瓦绿树：殖民建筑、欧式风格、花园城市',
        '海洋文化：海军基地、港口经济、帆船运动',
        '气候宜人：避暑胜地、空气清新、夏季凉爽',
        '旅游旺季：假期经济、游客众多、消费活跃'
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

// 导出青岛城市配置实例
export const qingdaoConfig = new QingdaoCityConfig()