import { CityConfig } from '../../ConfigManager'
import type { BuildingConfig, PriceStrategy, EventStrategy, TransportationStrategy, RentStrategy } from '../../ConfigManager'
import {
  ShanghaiPriceStrategy,
  ShanghaiEventStrategy,
  ShanghaiTransportationStrategy,
  ShanghaiRentStrategy
} from './strategies'
import { CITY_ID_MAP } from '../../city-id'
import type { GoodsDefinition, LocationDefinition } from '@/types/game'

// 上海城市配置 - 魔都特色：快节奏生活，雾霾天气，时尚潮流中心
export class ShanghaiCityConfig extends CityConfig {
  private locations: LocationDefinition[] = [
    { id: 0, name: "外滩", description: "上海外滩，金融中心", hasMarket: true },
    { id: 1, name: "陆家嘴", description: "陆家嘴金融区，现代化商业区", hasMarket: true },
    { id: 2, name: "南京路", description: "南京路步行街，传统商业街", hasMarket: true },
    { id: 3, name: "徐家汇", description: "徐家汇，商业中心" },
    { id: 4, name: "人民广场", description: "人民广场，交通枢纽" },
    { id: 5, name: "新天地", description: "新天地，时尚文化区", hasMarket: true },
    { id: 6, name: "静安寺", description: "静安寺，商业文化区" },
    { id: 7, name: "五角场", description: "五角场，大学城商业区" },
    { id: 9, name: "虹桥枢纽", description: "虹桥商务区，高铁与机场综合交通枢纽", hasMarket: true, isTrainStation: true, isAirport: true },
    { id: 10, name: "浦东机场", description: "浦东国际机场，国际航班集散地", isAirport: true },
    {
      id: 11,
      name: "花桥站",
      description: "沪苏轨交互通枢纽，可通过此处直接前往苏州",
      hasMarket: true,
      intercityTunnel: {
        targetCity: '苏州',
        type: 'train'
      }
    }
  ]

  private goods: GoodsDefinition[] = [
    { id: 100000, name: '进口香烟', basePrice: 100, priceRange: 350 },
    { id: 100001, name: '走私汽车', basePrice: 15000, priceRange: 15000 },
    { id: 100002, name: '潮玩手办', basePrice: 200, priceRange: 800 },
    { id: 100003, name: '山西假白酒', basePrice: 1000, priceRange: 2500 },
    { id: 100004, name: '《上海小宝贝》', basePrice: 5000, priceRange: 9000 },
    { id: 100005, name: '进口玩具', basePrice: 250, priceRange: 600 },
    { id: 100006, name: '水货手机', basePrice: 750, priceRange: 750 },
    { id: 100007, name: '伪劣化妆品', basePrice: 65, priceRange: 180 },
    { id: 100008, name: 'Labubu限量盲盒', basePrice: 320, priceRange: 1200 },
    { id: 100009, name: 'YOYO酱潮玩', basePrice: 260, priceRange: 900 }
  ]

  private buildings: BuildingConfig = {
    bank: { name: '银行', icon: '🏦' },
    hospital: {
      name: '医院',
      icon: '🏥',
      costPerPoint: 400,
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
          description: '在陆家嘴CBD工地打工，收入较高但体力消耗大',
          incomeRange: [350, 550],
          staminaCostRange: [8, 15]
        },
        {
          id: 'delivery',
          name: '送外卖',
          icon: '🛵',
          description: '在魔都送外卖，需要押金，收入中等',
          incomeRange: [12, 55],
          staminaCostRange: [5, 10],
          cost: 15,
          dailyLimit: 4
        },
        {
          id: 'warehouse',
          name: '仓库搬运',
          icon: '📦',
          description: '在虹桥物流园区搬运货物，收入中等',
          incomeRange: [220, 420],
          staminaCostRange: [6, 12]
        },
        {
          id: 'restaurant',
          name: '餐厅服务员',
          icon: '🍽️',
          description: '在新天地餐厅当服务员，收入较低但体力消耗小',
          incomeRange: [180, 320],
          staminaCostRange: [4, 8]
        },
        {
          id: 'cleaning',
          name: '清洁工',
          icon: '🧹',
          description: '在写字楼做清洁工作，收入最低但体力消耗最小',
          incomeRange: [120, 280],
          staminaCostRange: [3, 7]
        },
        {
          id: 'intern',
          name: '实习生',
          icon: '💻',
          description: '在金融公司当实习生，收入中等，需要一定技能',
          incomeRange: [200, 400],
          staminaCostRange: [4, 9]
        },
        {
          id: 'taxi',
          name: '网约车司机',
          icon: '🚕',
          description: '开网约车接单，收入较高但需要押金和车辆',
          incomeRange: [250, 450],
          staminaCostRange: [5, 11],
          cost: 200
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
          cost: 5000,
          monthlyRent: 5000,
          capacityIncrease: 20
        },
        {
          id: 'one-bedroom',
          name: '两室一厅',
          icon: '🏠',
          description: '两室一厅',
          cost: 7500,
          monthlyRent: 7500,
          capacityIncrease: 40,
          discountThreshold: 50000
        },
        {
          id: 'three-bedroom',
          name: '三室两厅',
          icon: '🏡',
          description: '三室两厅',
          cost: 12000,
          monthlyRent: 12000,
          capacityIncrease: 60,
          discountThreshold: 80000
        },
        {
          id: 'luxury',
          name: '豪华公寓',
          icon: '🏰',
          description: '豪华公寓',
          cost: 20000,
          monthlyRent: 20000,
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
      name: '浦东机场',
      icon: '✈️',
      description: '从浦东机场乘飞机前往其他城市'
    },
    trainStation: {
      name: '虹桥火车站',
      icon: '🚄',
      description: '从虹桥火车站乘高铁前往其他城市'
    }
  }

  private priceStrategy = new ShanghaiPriceStrategy()
  private eventStrategy = new ShanghaiEventStrategy()
  private transportationStrategy = new ShanghaiTransportationStrategy()
  private rentStrategy = new ShanghaiRentStrategy()

  constructor() {
    super(
      CITY_ID_MAP['上海'] ?? 1,
      '上海',
      '沪',
      '魔都上海，快节奏生活，雾霾天气，时尚潮流中心，金融重镇',
      [
        '快节奏生活：加班熬夜、996工作制、高压环境',
        '雾霾天气：空气污染、黄梅天潮湿、呼吸不适',
        '时尚潮流：外滩夜景、新天地酒吧、潮流文化',
        '金融中心：陆家嘴CBD、世界级金融市场',
        '美食多样：本帮菜、各种小吃、海派文化',
        '房价高昂：全国第二高房价、居住压力大'
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

// 导出上海城市配置实例
export const shanghaiConfig = new ShanghaiCityConfig()