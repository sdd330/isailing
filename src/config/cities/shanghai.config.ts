import type { ThemeConfig } from '../theme.config'

export const shanghaiTheme: ThemeConfig = {
  game: {
    title: 'iSailing',
    logo: '沪',
    logoColor: 'from-blue-500 to-cyan-500',
    description: '对话界面'
  },
  city: {
    name: '上海',
    shortName: '沪',
    locations: [
      { id: 0, name: "外滩", description: "上海外滩，金融中心" },
      { id: 1, name: "陆家嘴", description: "陆家嘴金融区，现代化商业区" },
      { id: 2, name: "南京路", description: "南京路步行街，传统商业街" },
      { id: 3, name: "徐家汇", description: "徐家汇，商业中心" },
      { id: 4, name: "人民广场", description: "人民广场，交通枢纽" },
      { id: 5, name: "新天地", description: "新天地，时尚文化区" },
      { id: 6, name: "田子坊", description: "田子坊，创意园区" },
      { id: 7, name: "静安寺", description: "静安寺，商业文化区" },
      { id: 8, name: "五角场", description: "五角场，大学城商业区" },
      { id: 9, name: "虹桥", description: "虹桥商务区，交通枢纽" }
    ]
  },
  goods: [
    { id: 100000, name: '进口香烟', basePrice: 100, priceRange: 350 },        // 上海ID=1, 商品index=0
    { id: 100001, name: '走私汽车', basePrice: 15000, priceRange: 15000 },    // 上海ID=1, 商品index=1
    { id: 100002, name: '潮玩手办', basePrice: 200, priceRange: 800 },        // 上海ID=1, 商品index=2
    { id: 100003, name: '山西假白酒', basePrice: 1000, priceRange: 2500 },    // 上海ID=1, 商品index=3
    { id: 100004, name: '《上海小宝贝》', basePrice: 5000, priceRange: 9000 }, // 上海ID=1, 商品index=4
    { id: 100005, name: '进口玩具', basePrice: 250, priceRange: 600 },        // 上海ID=1, 商品index=5
    { id: 100006, name: '水货手机', basePrice: 750, priceRange: 750 },        // 上海ID=1, 商品index=6
    { id: 100007, name: '伪劣化妆品', basePrice: 65, priceRange: 180 }         // 上海ID=1, 商品index=7
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
      { freq: 170, message: "专家提议提高大学生动手素质，进口玩具价格×2", goodsId: 100005, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
      { freq: 139, message: "有人自豪地说：生病不用打针吃药，喝假白酒就可以，山西假白酒价格×3", goodsId: 100003, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
      { freq: 100, message: "医院报告：《上海小宝贝》功效甚过伟哥，上海小宝贝价格×5", goodsId: 100004, priceMultiplier: 5, priceDivider: 0, goodsGiven: 0 },
      { freq: 41, message: "潮玩收藏家追捧，潮玩手办价格×4", goodsId: 100002, priceMultiplier: 4, priceDivider: 0, goodsGiven: 0 },
      { freq: 37, message: "上海经济小报：走私汽车大力推进汽车消费，走私汽车价格×3", goodsId: 100001, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
      { freq: 23, message: "上海真理报：提倡爱美，落到实处，伪劣化妆品价格×4", goodsId: 100007, priceMultiplier: 4, priceDivider: 0, goodsGiven: 0 },
      { freq: 37, message: "8858.com电子书店也不敢卖《上海小宝贝》，黑市一册可卖天价，上海小宝贝价格×8", goodsId: 100004, priceMultiplier: 8, priceDivider: 0, goodsGiven: 0 },
      { freq: 15, message: "谢不疯在晚会上说：我酷!我使用伪劣化妆品!，伪劣化妆品供不应求，价格×7", goodsId: 100007, priceMultiplier: 7, priceDivider: 0, goodsGiven: 0 },
      { freq: 40, message: "上海有人狂饮山西假酒，山西假白酒价格×7", goodsId: 100003, priceMultiplier: 7, priceDivider: 0, goodsGiven: 0 },
      { freq: 29, message: "上海的大学生们开始找工作，水货手机大受欢迎，价格×7", goodsId: 100006, priceMultiplier: 7, priceDivider: 0, goodsGiven: 0 },
      { freq: 35, message: "上海的富人疯狂地购买走私汽车，价格狂升，走私汽车价格×8", goodsId: 100001, priceMultiplier: 8, priceDivider: 0, goodsGiven: 0 },
      // 价格下跌事件
      { freq: 17, message: "市场上充斥着来自福建的走私香烟，进口香烟价格÷8", goodsId: 100000, priceMultiplier: 0, priceDivider: 8, goodsGiven: 0 },
      { freq: 24, message: "上海的孩子都忙于上网学习，进口玩具没人愿意买，价格÷5", goodsId: 100005, priceMultiplier: 0, priceDivider: 5, goodsGiven: 0 },
      { freq: 18, message: "市场饱和，潮玩手办价格÷8", goodsId: 100002, priceMultiplier: 0, priceDivider: 8, goodsGiven: 0 },
      // 赠送商品事件
      { freq: 160, message: "厦门的老同学资助俺两部走私汽车！发了！！", goodsId: 100001, priceMultiplier: 0, priceDivider: 0, goodsGiven: 2 },
      { freq: 45, message: "工商局扫荡后，俺在黑暗角落里发现了老乡丢失的进口香烟，赠送6包", goodsId: 100000, priceMultiplier: 0, priceDivider: 0, goodsGiven: 6 },
      { freq: 35, message: "老乡回家前留下山西假白酒，赠送4瓶", goodsId: 100003, priceMultiplier: 0, priceDivider: 0, goodsGiven: 4 },
      { freq: 140, message: "日本产品出事，强制购买水货手机(2500元)", goodsId: 100006, priceMultiplier: 0, priceDivider: 0, goodsGiven: 1, cost: 2500 }
    ],
    health: [
      { freq: 117, message: "地铁里被人推挤", damage: 3, sound: "kill.wav" },
      { freq: 157, message: "加班熬夜过度", damage: 20, sound: "death.wav" },
      { freq: 21, message: "城管追了三条街", damage: 1, sound: "dog.wav" },
      { freq: 100, message: "上海拥堵交通", damage: 1, sound: "harley.wav" },
      { freq: 35, message: "出租车司机态度差", damage: 1, sound: "hit.wav" },
      { freq: 313, message: "被外卖小哥撞到", damage: 10, sound: "flee.wav" },
      { freq: 120, message: "办公楼电梯故障", damage: 3, sound: "el.wav" },
      { freq: 29, message: "黄浦江气味熏人", damage: 1, sound: "vomit.wav" },
      { freq: 43, message: "房东涨租压力大", damage: 1, sound: "level.wav" },
      { freq: 45, message: "上海高温40度", damage: 1, sound: "lan.wav" },
      { freq: 48, message: "梅雨季节潮湿", damage: 1, sound: "breath.wav" },
      { freq: 33, message: "附近施工噪音", damage: 5, sound: "death.wav" }
    ],
    money: [
      { freq: 60, message: "地铁口遇到乞讨", cashMultiplier: 10 },
      { freq: 125, message: "街头被拦住要钱", cashMultiplier: 10 },
      { freq: 100, message: "地铁里被说别挤", cashMultiplier: 40 },
      { freq: 65, message: "城管罚款", cashMultiplier: 20 },
      { freq: 35, message: "交房租水电费", cashMultiplier: 15 },
      { freq: 27, message: "办居住证送钱", cashMultiplier: 10 },
      { freq: 40, message: "咖啡店消费", cashMultiplier: 5 },
      { freq: 50, message: "买彩票", cashMultiplier: 0, cashBased: true, minCash: 100, maxCash: 5000, profitMultiplier: 0.5, lossMultiplier: 0.1 },
      { freq: 45, message: "炒股", cashMultiplier: 0, cashBased: true, minCash: 5000, maxCash: 50000, profitMultiplier: 0.3, lossMultiplier: 0.2 },
      { freq: 55, message: "遭遇网恋诈骗", cashMultiplier: 0, cashBased: true, minCash: 1000, maxCash: 20000, isProfit: false, lossMultiplier: 0.15 },
      { freq: 30, message: "投资P2P暴雷", cashMultiplier: 0, cashBased: true, minCash: 5000, maxCash: 100000, isProfit: false, lossMultiplier: 0.25 },
      { freq: 25, message: "参与众筹", cashMultiplier: 0, cashBased: true, minCash: 2000, maxCash: 30000, profitMultiplier: 0.4, lossMultiplier: 0.3 }
    ]
  }
}

