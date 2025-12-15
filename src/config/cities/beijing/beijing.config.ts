import type { LocationDefinition, GoodsDefinition } from '@/types/game'
import { CityConfig } from '../../ConfigManager'
import type { BuildingConfig, PriceStrategy, EventStrategy, TransportationStrategy, RentStrategy } from '../../ConfigManager'
import { CITY_ID_MAP } from '../../city-id'
import {
  BeijingPriceStrategy,
  BeijingEventStrategy,
  BeijingTransportationStrategy,
  BeijingRentStrategy
} from './strategies'

// 北京城市配置 - 首都特色：空气污染严重，人口密集，文化古都
export class BeijingCityConfig extends CityConfig {
  private locations: LocationDefinition[] = [
    { id: 0, name: "北京站", description: "北京火车站，人员密集", isTrainStation: true },
    { id: 1, name: "西直门", description: "西直门地铁站，交通枢纽" },
    { id: 2, name: "崇文门", description: "崇文门，传统商业区" },
    { id: 3, name: "东直门", description: "东直门，现代化商业区" },
    { id: 4, name: "复兴门", description: "复兴门，政府办公区" },
    { id: 5, name: "积水潭", description: "积水潭，文化教育区" },
    { id: 6, name: "长椿街", description: "长椿街，传统街区" },
    { id: 7, name: "公主坟", description: "公主坟，商业中心" },
    { id: 8, name: "苹果园", description: "苹果园，地铁一号线终点站" },
    { id: 9, name: "工体", description: "工人体育场，体育娱乐区" },
    { id: 10, name: "首都机场", description: "首都国际机场，重要航空枢纽", isAirport: true }
  ]

  private goods: GoodsDefinition[] = [
    { id: 0, name: '进口香烟', basePrice: 100, priceRange: 350 },
    { id: 1, name: '走私汽车', basePrice: 15000, priceRange: 15000 },
    { id: 2, name: '潮玩手办', basePrice: 200, priceRange: 800 },
    { id: 3, name: '山西假白酒', basePrice: 1000, priceRange: 2500 },
    { id: 4, name: '《上海小宝贝》', basePrice: 5000, priceRange: 9000 },
    { id: 5, name: '进口玩具', basePrice: 250, priceRange: 600 },
    { id: 6, name: '水货手机', basePrice: 750, priceRange: 750 },
    { id: 7, name: '伪劣化妆品', basePrice: 65, priceRange: 180 },
    { id: 8, name: 'Labubu盲盒', basePrice: 280, priceRange: 900 },
    { id: 9, name: 'YOYO酱手办', basePrice: 220, priceRange: 700 }
  ]

  private buildings: BuildingConfig = {
    bank: { name: '银行', icon: '🏦' },
    hospital: {
      name: '医院',
      icon: '🏥',
      costPerPoint: 350,
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
          description: '在首都建筑工地打工，收入较高但体力消耗大',
          incomeRange: [300, 500],
          staminaCostRange: [8, 15]
        },
        {
          id: 'delivery',
          name: '送外卖',
          icon: '🛵',
          description: '在帝都送外卖，需要押金，收入中等',
          incomeRange: [10, 50],
          staminaCostRange: [5, 10],
          cost: 15,
          dailyLimit: 4
        },
        {
          id: 'warehouse',
          name: '仓库搬运',
          icon: '📦',
          description: '在物流园区搬运货物，收入中等',
          incomeRange: [200, 400],
          staminaCostRange: [6, 12]
        },
        {
          id: 'restaurant',
          name: '餐厅服务员',
          icon: '🍽️',
          description: '在胡同餐厅当服务员，收入较低',
          incomeRange: [150, 300],
          staminaCostRange: [4, 8]
        },
        {
          id: 'cleaning',
          name: '清洁工',
          icon: '🧹',
          description: '在写字楼做清洁工作，收入最低',
          incomeRange: [100, 250],
          staminaCostRange: [3, 7]
        },
        {
          id: 'security',
          name: '保安',
          icon: '🛡️',
          description: '在政府办公区当保安，收入稳定',
          incomeRange: [180, 320],
          staminaCostRange: [3, 6]
        },
        {
          id: 'tourguide',
          name: '导游',
          icon: '🎫',
          description: '在故宫、长城当导游，收入较高但需要技能',
          incomeRange: [250, 450],
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
          cost: 4500,
          monthlyRent: 4500,
          capacityIncrease: 20
        },
        {
          id: 'one-bedroom',
          name: '两室一厅',
          icon: '🏠',
          description: '两室一厅',
          cost: 7000,
          monthlyRent: 7000,
          capacityIncrease: 40,
          discountThreshold: 50000
        },
        {
          id: 'three-bedroom',
          name: '三室两厅',
          icon: '🏡',
          description: '三室两厅',
          cost: 11000,
          monthlyRent: 11000,
          capacityIncrease: 60,
          discountThreshold: 80000
        },
        {
          id: 'luxury',
          name: '豪华公寓',
          icon: '🏰',
          description: '豪华公寓',
          cost: 18000,
          monthlyRent: 18000,
          capacityIncrease: 80,
          discountThreshold: 120000
        }
      ]
    },
    subway: {
      name: '地铁',
      icon: '🚇',
      description: '乘坐地铁出行'
    },
    airport: {
      name: '首都机场',
      icon: '✈️',
      description: '从首都机场乘飞机前往其他城市'
    },
    trainStation: {
      name: '北京站',
      icon: '🚄',
      description: '从北京站乘高铁前往其他城市'
    }
  }

  private priceStrategy = new BeijingPriceStrategy()
  private eventStrategy = new BeijingEventStrategy()
  private transportationStrategy = new BeijingTransportationStrategy()
  private rentStrategy = new BeijingRentStrategy()

  constructor() {
    super(
      CITY_ID_MAP['北京'] ?? 0,
      '北京',
      '京',
      '帝都北京，文化古都，空气污染严重，人口密度极大，竞争激烈',
      [
        '空气污染：PM2.5爆表、沙尘暴席卷京城、呼吸困难',
        '人口密集：交通拥堵、胡同追逐、压力巨大',
        '文化底蕴：故宫、长城、胡同文化、京剧艺术',
        '经济发达：金融中心、科技产业集聚、国际影响力',
        '气候干燥：春秋季节过敏频发、冬季取暖',
        '房价高企：全国最高房价城市之一、居住成本高'
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

// 导出北京城市配置实例
export const beijingConfig = new BeijingCityConfig()

