import type { ThemeConfig } from '../theme.config'

export const guangzhouTheme: ThemeConfig = {
  game: {
    title: '羊城创业记',
    logo: '穗',
    logoColor: 'from-green-500 to-emerald-500',
    description: '对话界面'
  },
  city: {
    name: '广州',
    shortName: '穗',
    locations: [
      { id: 0, name: "天河城", description: "天河城，商业中心" },
      { id: 1, name: "珠江新城", description: "珠江新城，金融中心" },
      { id: 2, name: "北京路", description: "北京路，传统商业街" },
      { id: 3, name: "上下九", description: "上下九，步行街" },
      { id: 4, name: "体育西路", description: "体育西路，交通枢纽" },
      { id: 5, name: "大学城", description: "大学城，教育区" },
      { id: 6, name: "琶洲", description: "琶洲，会展中心" },
      { id: 7, name: "白云山", description: "白云山，风景区" },
      { id: 8, name: "越秀公园", description: "越秀公园，文化区" },
      { id: 9, name: "沙面", description: "沙面，历史街区" }
    ]
  },
  goods: [
    { id: 200000, name: '广式点心', basePrice: 80, priceRange: 200 },        // 广州ID=2, 商品index=0
    { id: 200001, name: '进口电子产品', basePrice: 2000, priceRange: 5000 }, // 广州ID=2, 商品index=1
    { id: 200002, name: '服装批发', basePrice: 50, priceRange: 300 },       // 广州ID=2, 商品index=2
    { id: 200003, name: '茶叶', basePrice: 200, priceRange: 800 },         // 广州ID=2, 商品index=3
    { id: 200004, name: '《岭南文化》', basePrice: 4000, priceRange: 8000 },  // 广州ID=2, 商品index=4
    { id: 200005, name: '进口水果', basePrice: 150, priceRange: 500 },      // 广州ID=2, 商品index=5
    { id: 200006, name: '手机配件', basePrice: 100, priceRange: 400 },      // 广州ID=2, 商品index=6
    { id: 200007, name: '中药材', basePrice: 300, priceRange: 1000 }        // 广州ID=2, 商品index=7
  ],
  buildings: {
    bank: {
      name: '银行',
      icon: '🏦'
    },
    hospital: {
      name: '医院',
      icon: '🏥'
    },
    delivery: {
      name: '送外卖',
      icon: '🛵',
      description: '送外卖赚取收入'
    },
    constructionSite: {
      name: '建筑工地',
      icon: '🏗️',
      description: '去工地打工赚取收入（有受伤风险）'
    },
    postOffice: {
      name: '邮局',
      icon: '📬',
      description: '偿还债务'
    },
    house: {
      name: '房屋扩建',
      icon: '🏠',
      description: '增加仓库容量'
    },
    airport: {
      name: '机场',
      icon: '✈️',
      description: '乘坐飞机前往其他城市'
    },
    trainStation: {
      name: '火车站',
      icon: '🚄',
      description: '乘坐高铁前往其他城市'
    }
  },
  events: {
    commercial: [
      { freq: 170, message: "广交会开幕，服装批发价格×2", goodsId: 200002, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
      { freq: 139, message: "文化节推荐，《岭南文化》价格×5", goodsId: 200004, priceMultiplier: 5, priceDivider: 0, goodsGiven: 0 },
      { freq: 100, message: "网红推荐，广式点心价格×4", goodsId: 200000, priceMultiplier: 4, priceDivider: 0, goodsGiven: 0 },
      { freq: 41, message: "广州车展，电子产品价格×3", goodsId: 200001, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
      { freq: 37, message: "茶文化节，茶叶价格×4", goodsId: 200003, priceMultiplier: 4, priceDivider: 0, goodsGiven: 0 },
      { freq: 23, message: "健康生活，中药材价格×3", goodsId: 200007, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
      { freq: 37, message: "限量版发布，手机配件价格×8", goodsId: 200006, priceMultiplier: 8, priceDivider: 0, goodsGiven: 0 },
      { freq: 15, message: "明星同款，进口水果价格×7", goodsId: 200005, priceMultiplier: 7, priceDivider: 0, goodsGiven: 0 },
      { freq: 40, message: "广州人追捧，茶叶价格×7", goodsId: 200003, priceMultiplier: 7, priceDivider: 0, goodsGiven: 0 },
      { freq: 29, message: "白领需求增加，电子产品价格×7", goodsId: 200001, priceMultiplier: 7, priceDivider: 0, goodsGiven: 0 },
      { freq: 35, message: "富人购买，中药材价格×8", goodsId: 200007, priceMultiplier: 8, priceDivider: 0, goodsGiven: 0 },
      { freq: 17, message: "市场饱和，广式点心价格÷8", goodsId: 200000, priceMultiplier: 0, priceDivider: 8, goodsGiven: 0 },
      { freq: 24, message: "学生消费降级，服装批发价格÷5", goodsId: 200002, priceMultiplier: 0, priceDivider: 5, goodsGiven: 0 },
      { freq: 18, message: "市场监管，手机配件价格÷8", goodsId: 200006, priceMultiplier: 0, priceDivider: 8, goodsGiven: 0 },
      { freq: 160, message: "老同学资助，电子产品赠送2件", goodsId: 200001, priceMultiplier: 0, priceDivider: 0, goodsGiven: 2 },
      { freq: 45, message: "茶店促销，茶叶赠送6包", goodsId: 200003, priceMultiplier: 0, priceDivider: 0, goodsGiven: 6 },
      { freq: 35, message: "朋友离开前留下广式点心，赠送4盒", goodsId: 200000, priceMultiplier: 0, priceDivider: 0, goodsGiven: 4 },
      { freq: 140, message: "海外代购出问题，强制购买手机配件(500元)", goodsId: 200006, priceMultiplier: 0, priceDivider: 0, goodsGiven: 1, cost: 500 }
    ],
    health: [
      { freq: 117, message: "地铁里被人推挤", damage: 3, sound: "kill.wav" },
      { freq: 157, message: "加班熬夜过度", damage: 20, sound: "death.wav" },
      { freq: 21, message: "城管追了三条街", damage: 1, sound: "dog.wav" },
      { freq: 100, message: "广州拥堵交通", damage: 1, sound: "harley.wav" },
      { freq: 35, message: "出租车司机态度差", damage: 1, sound: "hit.wav" },
      { freq: 313, message: "被外卖小哥撞到", damage: 10, sound: "flee.wav" },
      { freq: 120, message: "办公楼电梯故障", damage: 3, sound: "el.wav" },
      { freq: 29, message: "珠江气味熏人", damage: 1, sound: "vomit.wav" },
      { freq: 43, message: "房东涨租压力大", damage: 1, sound: "level.wav" },
      { freq: 45, message: "广州高温40度", damage: 1, sound: "lan.wav" },
      { freq: 48, message: "台风天气", damage: 1, sound: "breath.wav" },
      { freq: 33, message: "附近施工噪音", damage: 5, sound: "death.wav" }
    ],
    money: [
      { freq: 60, message: "地铁口遇到乞讨", cashMultiplier: 10 },
      { freq: 125, message: "街头被拦住要钱", cashMultiplier: 10 },
      { freq: 100, message: "地铁里被说别挤", cashMultiplier: 40 },
      { freq: 65, message: "城管罚款", cashMultiplier: 20 },
      { freq: 35, message: "交房租水电费", cashMultiplier: 15 },
      { freq: 27, message: "办居住证送钱", cashMultiplier: 10 },
      { freq: 40, message: "茶楼消费", cashMultiplier: 5 },
      { freq: 50, message: "买彩票中奖", cashMultiplier: 0, cashBased: true, minCash: 100, maxCash: 5000, profitMultiplier: 0.5, lossMultiplier: 0.1 },
      { freq: 45, message: "炒股", cashMultiplier: 0, cashBased: true, minCash: 5000, maxCash: 50000, profitMultiplier: 0.3, lossMultiplier: 0.2 },
      { freq: 55, message: "遭遇网恋诈骗", cashMultiplier: 0, cashBased: true, minCash: 1000, maxCash: 20000, isProfit: false, lossMultiplier: 0.15 },
      { freq: 30, message: "投资P2P暴雷", cashMultiplier: 0, cashBased: true, minCash: 5000, maxCash: 100000, isProfit: false, lossMultiplier: 0.25 },
      { freq: 25, message: "参与众筹", cashMultiplier: 0, cashBased: true, minCash: 2000, maxCash: 30000, profitMultiplier: 0.4, lossMultiplier: 0.3 }
    ]
  }
}

