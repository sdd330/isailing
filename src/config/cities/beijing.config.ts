import type { ThemeConfig } from '../theme.config'

export const beijingTheme: ThemeConfig = {
  game: {
    title: 'iSailing',
    logo: '京',
    logoColor: 'from-purple-500 to-pink-500',
    description: '对话界面'
  },
  city: {
    name: '北京',
    shortName: '京',
    locations: [
      { id: 0, name: "北京站", description: "北京火车站，人员密集" },
      { id: 1, name: "西直门", description: "西直门地铁站，交通枢纽" },
      { id: 2, name: "崇文门", description: "崇文门，传统商业区" },
      { id: 3, name: "东直门", description: "东直门，现代化商业区" },
      { id: 4, name: "复兴门", description: "复兴门，政府办公区" },
      { id: 5, name: "积水潭", description: "积水潭，文化教育区" },
      { id: 6, name: "长椿街", description: "长椿街，传统街区" },
      { id: 7, name: "公主坟", description: "公主坟，商业中心" },
      { id: 8, name: "平果园", description: "平果园，居民区" },
      { id: 9, name: "工体", description: "工人体育场，体育娱乐区" }
    ]
  },
  goods: [
    { id: 0, name: '进口香烟', basePrice: 100, priceRange: 350 },        // 北京ID=0, 商品index=0
    { id: 1, name: '走私汽车', basePrice: 15000, priceRange: 15000 },    // 北京ID=0, 商品index=1
    { id: 2, name: '潮玩手办', basePrice: 200, priceRange: 800 },        // 北京ID=0, 商品index=2
    { id: 3, name: '山西假白酒', basePrice: 1000, priceRange: 2500 },    // 北京ID=0, 商品index=3
    { id: 4, name: '《上海小宝贝》', basePrice: 5000, priceRange: 9000 }, // 北京ID=0, 商品index=4
    { id: 5, name: '进口玩具', basePrice: 250, priceRange: 600 },        // 北京ID=0, 商品index=5
    { id: 6, name: '水货手机', basePrice: 750, priceRange: 750 },        // 北京ID=0, 商品index=6
    { id: 7, name: '伪劣化妆品', basePrice: 65, priceRange: 180 }       // 北京ID=0, 商品index=7
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
      { freq: 170, message: "专家提议提高大学生动手素质，进口玩具价格×2", goodsId: 5, priceMultiplier: 2, priceDivider: 0, goodsGiven: 0 },
      { freq: 139, message: "医院报告：《上海小宝贝》功效甚过伟哥，上海小宝贝价格×5", goodsId: 4, priceMultiplier: 5, priceDivider: 0, goodsGiven: 0 },
      { freq: 100, message: "潮玩收藏家追捧，潮玩手办价格×4", goodsId: 2, priceMultiplier: 4, priceDivider: 0, goodsGiven: 0 },
      { freq: 41, message: "北京经济小报：走私汽车大力推进汽车消费，走私汽车价格×3", goodsId: 1, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
      { freq: 37, message: "北京真理报：提倡爱美，落到实处，伪劣化妆品价格×4", goodsId: 7, priceMultiplier: 4, priceDivider: 0, goodsGiven: 0 },
      { freq: 23, message: "8858.com说：生病不用打针吃药，喝假白酒就可以，山西假白酒价格×3", goodsId: 3, priceMultiplier: 3, priceDivider: 0, goodsGiven: 0 },
      { freq: 37, message: "上海小宝贝黑市一册可卖天价，上海小宝贝价格×8", goodsId: 4, priceMultiplier: 8, priceDivider: 0, goodsGiven: 0 },
      { freq: 15, message: "谢不疯使用伪劣化妆品，伪劣化妆品价格×7", goodsId: 7, priceMultiplier: 7, priceDivider: 0, goodsGiven: 0 },
      { freq: 40, message: "北京人狂饮山西假酒，山西假白酒价格×7", goodsId: 3, priceMultiplier: 7, priceDivider: 0, goodsGiven: 0 },
      { freq: 29, message: "北京大学生找工作，水货手机价格×7", goodsId: 6, priceMultiplier: 7, priceDivider: 0, goodsGiven: 0 },
      { freq: 35, message: "北京富人购买走私汽车，走私汽车价格×8", goodsId: 1, priceMultiplier: 8, priceDivider: 0, goodsGiven: 0 },
      { freq: 17, message: "市场上充斥福建走私香烟，进口香烟价格÷8", goodsId: 0, priceMultiplier: 0, priceDivider: 8, goodsGiven: 0 },
      { freq: 24, message: "北京孩子上网学习，进口玩具价格÷5", goodsId: 5, priceMultiplier: 0, priceDivider: 5, goodsGiven: 0 },
      { freq: 18, message: "市场饱和，潮玩手办价格÷8", goodsId: 2, priceMultiplier: 0, priceDivider: 8, goodsGiven: 0 },
      { freq: 160, message: "厦门老同学资助，走私汽车赠送2部", goodsId: 1, priceMultiplier: 0, priceDivider: 0, goodsGiven: 2 },
      { freq: 45, message: "工商局扫荡后发现，进口香烟赠送6包", goodsId: 0, priceMultiplier: 0, priceDivider: 0, goodsGiven: 6 },
      { freq: 35, message: "老乡回家留下山西假白酒，赠送4瓶", goodsId: 3, priceMultiplier: 0, priceDivider: 0, goodsGiven: 4 },
      { freq: 140, message: "日本产品出事，强制购买水货手机(2500元)", goodsId: 6, priceMultiplier: 0, priceDivider: 0, goodsGiven: 1, cost: 2500 }
    ],
    health: [
      { freq: 117, message: "大街上两个流氓打了俺", damage: 3, sound: "kill.wav" },
      { freq: 157, message: "地道被人打了蒙棍", damage: 20, sound: "death.wav" },
      { freq: 21, message: "工商局追超过三个胡同", damage: 1, sound: "dog.wav" },
      { freq: 100, message: "北京拥挤交通", damage: 1, sound: "harley.wav" },
      { freq: 35, message: "开小巴打一耳光", damage: 1, sound: "hit.wav" },
      { freq: 313, message: "一群民工打了俺", damage: 10, sound: "flee.wav" },
      { freq: 120, message: "写字楼假保安电击", damage: 3, sound: "el.wav" },
      { freq: 29, message: "北京臭河熏着我", damage: 1, sound: "vomit.wav" },
      { freq: 43, message: "王大婶嘲笑没北京户口", damage: 1, sound: "level.wav" },
      { freq: 45, message: "北京高温40度", damage: 1, sound: "lan.wav" },
      { freq: 48, message: "申奥添风景-沙尘暴", damage: 1, sound: "breath.wav" },
      { freq: 33, message: "附近青年砸砖头", damage: 5, sound: "death.wav" }
    ],
    money: [
      { freq: 60, message: "怜悯地铁口老太太", cashMultiplier: 10 },
      { freq: 125, message: "街头拦住要钱", cashMultiplier: 10 },
      { freq: 100, message: "碰了一下说别挤", cashMultiplier: 40 },
      { freq: 65, message: "红袖章罚款", cashMultiplier: 20 },
      { freq: 35, message: "交长话费上网费", cashMultiplier: 15 },
      { freq: 27, message: "办经商证送钱", cashMultiplier: 10 },
      { freq: 40, message: "氧吧吸氧", cashMultiplier: 5 },
      { freq: 50, message: "买彩票中奖", cashMultiplier: 0, cashBased: true, minCash: 100, maxCash: 5000, profitMultiplier: 0.5, lossMultiplier: 0.1 },
      { freq: 45, message: "炒股", cashMultiplier: 0, cashBased: true, minCash: 5000, maxCash: 50000, profitMultiplier: 0.3, lossMultiplier: 0.2 },
      { freq: 55, message: "遭遇网恋诈骗", cashMultiplier: 0, cashBased: true, minCash: 1000, maxCash: 20000, isProfit: false, lossMultiplier: 0.15 },
      { freq: 30, message: "投资P2P暴雷", cashMultiplier: 0, cashBased: true, minCash: 5000, maxCash: 100000, isProfit: false, lossMultiplier: 0.25 },
      { freq: 25, message: "参与众筹", cashMultiplier: 0, cashBased: true, minCash: 2000, maxCash: 30000, profitMultiplier: 0.4, lossMultiplier: 0.3 }
    ]
  }
}

