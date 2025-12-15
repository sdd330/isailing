import { CityConfig } from '../../ConfigManager'
import type { BuildingConfig, PriceStrategy, EventStrategy, TransportationStrategy, RentStrategy } from '../../ConfigManager'
import {
  ShenzhenPriceStrategy,
  ShenzhenEventStrategy,
  ShenzhenTransportationStrategy,
  ShenzhenRentStrategy
} from './strategies'
import { CITY_ID_MAP } from '../../city-id'
import type { GoodsDefinition, LocationDefinition } from '@/types/game'

// 深圳城市配置 - 鹏城特色：创新之都，打工人天堂，跨境电商中心
export class ShenzhenCityConfig extends CityConfig {
  private locations: LocationDefinition[] = [
    { id: 0, name: '深圳北站', description: '深圳北高铁站，交通枢纽', isTrainStation: true },
    { id: 1, name: '福田CBD', description: '福田CBD，高楼林立' },
    { id: 2, name: '南山科技园', description: '南山区科技园，互联网大厂云集' },
    { id: 3, name: '华强北', description: '华强北，电子数码批发街' },
    { id: 4, name: '罗湖口岸', description: '罗湖口岸，人流密集' },
    { id: 5, name: '蛇口', description: '蛇口，自贸区与码头' },
    { id: 6, name: '世界之窗', description: '世界之窗，旅游景区' },
    { id: 7, name: '大梅沙', description: '大梅沙海滨公园，游客众多' },
    { id: 8, name: '宝安机场', description: '深圳宝安国际机场', isAirport: true },
    { id: 9, name: '前海', description: '前海自贸区，金融科技区' }
  ]

  private goods: GoodsDefinition[] = [
    { id: 300000, name: '水货电子配件', basePrice: 200, priceRange: 800 },
    { id: 300001, name: '二手手机', basePrice: 600, priceRange: 1500 },
    { id: 300002, name: '翻新平板', basePrice: 900, priceRange: 2000 },
    { id: 300003, name: '代购数码相机', basePrice: 1800, priceRange: 4000 },
    { id: 300004, name: '跨境假冒名表', basePrice: 1200, priceRange: 3500 },
    { id: 300005, name: '网红充电宝', basePrice: 120, priceRange: 300 },
    { id: 300006, name: '代理游戏点卡', basePrice: 80, priceRange: 250 },
    { id: 300007, name: '仿牌运动鞋', basePrice: 260, priceRange: 900 }
  ]

  private buildings: BuildingConfig = {
    bank: { name: '银行', icon: '🏦' },
    hospital: { name: '医院', icon: '🏥' },
    constructionSite: {
      name: '打工',
      icon: '💼',
      description: '选择工作类型赚取收入',
      workTypes: [
        {
          id: 'construction',
          name: '建筑工地',
          icon: '🏗️',
          description: '在前海建筑工地打工，收入较高',
          incomeRange: [320, 520],
          staminaCostRange: [8, 15]
        },
        {
          id: 'delivery',
          name: '送外卖',
          icon: '🛵',
          description: '在科技园送外卖，需要押金，收入中等',
          incomeRange: [12, 52],
          staminaCostRange: [5, 10],
          cost: 16,
          dailyLimit: 4
        },
        {
          id: 'warehouse',
          name: '仓库搬运',
          icon: '📦',
          description: '在华强北仓库搬运电子配件，收入中等',
          incomeRange: [220, 420],
          staminaCostRange: [6, 12]
        },
        {
          id: 'restaurant',
          name: '餐厅服务员',
          icon: '🍽️',
          description: '在餐厅当服务员，收入较低',
          incomeRange: [160, 320],
          staminaCostRange: [4, 8]
        },
        {
          id: 'cleaning',
          name: '清洁工',
          icon: '🧹',
          description: '在写字楼做清洁工作，收入最低',
          incomeRange: [110, 260],
          staminaCostRange: [3, 7]
        },
        {
          id: 'tech',
          name: 'IT外包',
          icon: '💻',
          description: '在科技园接外包项目，收入较高但需要技能',
          incomeRange: [280, 480],
          staminaCostRange: [6, 12]
        },
        {
          id: 'crossborder',
          name: '跨境电商助理',
          icon: '📦',
          description: '在跨境电商公司当助理，收入较高',
          incomeRange: [240, 440],
          staminaCostRange: [5, 10]
        }
      ]
    },
    postOffice: { name: '邮局', icon: '📬', description: '偿还债务' },
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
    subway: { name: '地铁', icon: '🚇', description: '乘坐地铁出行' },
    airport: { name: '宝安机场', icon: '✈️', description: '从宝安机场乘飞机前往其他城市' },
    trainStation: { name: '深圳北站', icon: '🚄', description: '从深圳北站乘高铁前往其他城市' }
  }

  private priceStrategy = new ShenzhenPriceStrategy()
  private eventStrategy = new ShenzhenEventStrategy()
  private transportationStrategy = new ShenzhenTransportationStrategy()
  private rentStrategy = new ShenzhenRentStrategy()

  constructor() {
    super(
      CITY_ID_MAP['深圳'] ?? 3,
      '深圳',
      '深',
      '鹏城深圳，创新之都，打工人天堂，跨境电商中心，年轻活力城市',
      [
        '创新之都：科技产业、互联网巨头、创业氛围浓厚',
        '打工人天堂：996加班、通宵写代码、高压生活',
        '跨境电商：华强北、水货电子、国际贸易活跃',
        '年轻活力：新兴城市、新移民多、时尚潮流',
        '房价高企：全国第三高房价、居住成本高',
        '交通便利：宝安机场、深圳北站、高铁发达'
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

// 导出深圳城市配置实例
export const shenzhenConfig = new ShenzhenCityConfig()