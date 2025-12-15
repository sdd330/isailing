import type { LocationDefinition, GoodsDefinition } from '@/types/game'
import { CityConfig } from '../../ConfigManager'
import type { BuildingConfig, PriceStrategy, EventStrategy, TransportationStrategy, RentStrategy } from '../../ConfigManager'
import { CITY_ID_MAP } from '../../city-id'
import {
  TianjinPriceStrategy,
  TianjinEventStrategy,
  TianjinTransportationStrategy,
  TianjinRentStrategy
} from './strategies'

// 天津城市配置 - 津门特色：海河港口，天津卫文化，北方美食之都
export class TianjinCityConfig extends CityConfig {
  private locations: LocationDefinition[] = [
    { id: 0, name: '天津站', description: '天津站，京津城际重要枢纽', isTrainStation: true },
    { id: 1, name: '滨江道', description: '滨江道商业街，人流密集' },
    { id: 2, name: '古文化街', description: '古文化街，旅游纪念品集中地' },
    { id: 3, name: '意大利风情区', description: '意风区，咖啡馆和小酒馆林立' },
    { id: 4, name: '南开大学', description: '高校区，学生消费活跃' },
    { id: 5, name: '天津大学', description: '高校区，科技氛围浓厚' },
    { id: 6, name: '海河边', description: '海河观光带' },
    { id: 7, name: '五月花广场', description: '居民区周边小商铺林立' },
    { id: 8, name: '滨海新区', description: '滨海新区，新兴开发区' },
    { id: 9, name: '天津之眼', description: '天津之眼摩天轮，网红打卡地' },
    { id: 10, name: '滨海机场', description: '天津滨海国际机场，环渤海航空枢纽', isAirport: true }
  ]

  private goods: GoodsDefinition[] = [
    { id: 600000, name: '耳朵眼炸糕', basePrice: 40, priceRange: 120 },
    { id: 600001, name: '狗不理包子礼盒', basePrice: 120, priceRange: 400 },
    { id: 600002, name: '相声票代售', basePrice: 200, priceRange: 800 },
    { id: 600003, name: '海河夜游套票', basePrice: 260, priceRange: 800 },
    { id: 600004, name: '假冒特产礼盒', basePrice: 90, priceRange: 260 },
    { id: 600005, name: '小商品批发', basePrice: 60, priceRange: 200 },
    { id: 600006, name: '二手单反相机', basePrice: 900, priceRange: 2000 },
    { id: 600007, name: '老式收音机', basePrice: 180, priceRange: 500 },
    { id: 600008, name: '美食礼盒', basePrice: 150, priceRange: 400 },
    { id: 600009, name: '海鲜礼盒', basePrice: 200, priceRange: 600 }
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
          description: '在天津建筑工地打工，收入较高',
          incomeRange: [300, 500],
          staminaCostRange: [8, 15]
        },
        {
          id: 'delivery',
          name: '送外卖',
          icon: '🛵',
          description: '在天津街头送外卖，需要押金，收入中等',
          incomeRange: [10, 50],
          staminaCostRange: [5, 10],
          cost: 15,
          dailyLimit: 4
        },
        {
          id: 'warehouse',
          name: '仓库搬运',
          icon: '📦',
          description: '在港口仓库搬运货物，收入中等',
          incomeRange: [200, 400],
          staminaCostRange: [6, 12]
        },
        {
          id: 'restaurant',
          name: '餐厅服务员',
          icon: '🍽️',
          description: '在古文化街餐厅当服务员，收入较低',
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
          id: 'port',
          name: '港口工人',
          icon: '⚓',
          description: '在滨海新区港口工作，收入较高',
          incomeRange: [250, 450],
          staminaCostRange: [7, 14]
        },
        {
          id: 'tourguide',
          name: '导游',
          icon: '🎫',
          description: '在意大利风情区当导游，收入中等',
          incomeRange: [180, 340],
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
      name: '滨海机场',
      icon: '✈️',
      description: '从滨海机场乘飞机前往其他城市'
    },
    trainStation: {
      name: '天津站',
      icon: '🚄',
      description: '从天津站乘高铁前往其他城市'
    }
  }

  private priceStrategy = new TianjinPriceStrategy()
  private eventStrategy = new TianjinEventStrategy()
  private transportationStrategy = new TianjinTransportationStrategy()
  private rentStrategy = new TianjinRentStrategy()

  constructor() {
    super(
      CITY_ID_MAP['天津'] ?? 6,
      '天津',
      '津',
      '津门天津，海河港口，天津卫文化，北方美食之都，近代开埠城市',
      [
        '海河港口：天津港、港口贸易、海河文化',
        '天津卫文化：卫嘴子、天津话、相声艺术',
        '美食之都：狗不理包子、十八街麻花、各种小吃',
        '近代开埠：租界文化、殖民建筑、历史遗迹',
        '工业基础：重工业、港口经济、制造业强',
        '气候特征：海风大、湿度高、温差变化明显'
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

// 导出天津城市配置实例
export const tianjinConfig = new TianjinCityConfig()


