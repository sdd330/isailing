export interface GameConfig {
  initial: {
    cash: number
    debt: number
    health: number
    fame: number
    capacity: number
  }
  time: {
    totalWeeks: number
    unit: string
    unitDescription: string
    triggerWeeksLeft: number
  }
  financial: {
    debtInterestRate: number
    bankInterestRate: number
    maxDebtLimit: number
    hackerEnabled: boolean
  }
  buildings: {
    hospital: {
      costPerPoint: number
      triggerHealth: number
    }
    delivery: {
      cost: number
      bonusRange: [number, number]
      healthRisk: [number, number]  // 健康风险范围 [最小值, 最大值]
    }
    constructionSite: {
      incomeRange: [number, number]  // 收入范围 [最小值, 最大值]
      healthLoss: [number, number]  // 正常健康减少 [最小值, 最大值]
      injuryRisk: number  // 受伤风险概率 (0-100)
      injuryDamage: [number, number]  // 受伤时健康减少 [最小值, 最大值]
    }
    house: {
      expansionCost: number
      discountThreshold: number
      capacityIncrease: number
    }
  }
  transportation: {
    train: {
      beijingShanghai: number
      beijingGuangzhou: number
      shanghaiGuangzhou: number
    }
    plane: {
      beijingShanghai: number
      beijingGuangzhou: number
      shanghaiGuangzhou: number
    }
  }
  priceGeneration: {
    defaultLeaveOut: number
    finalWeeksLeaveOut: number
    transportationHubLeaveOut: number
  }
  random: {
    commercialRange: number
    healthRange: number
    moneyRange: number
  }
  dialogs: {
    defaultDepositAmount: number
    defaultWithdrawAmount: number
    quickDebtAmounts: number[]
    percentageOptions: number[]
  }
  achievements: {
    persistenceWeeks: number
    wealthThreshold: number
    eliteThreshold: number
  }
}

export const gameConfig: GameConfig = {
  initial: {
    cash: 2000,
    debt: 5000,
    health: 100,
    fame: 100,
    capacity: 100
  },
  time: {
    totalWeeks: 52,
    unit: '周',
    unitDescription: '一年',
    triggerWeeksLeft: 3
  },
  financial: {
    debtInterestRate: 0.10,
    bankInterestRate: 0.01,
    maxDebtLimit: 100000,
    hackerEnabled: true
  },
  buildings: {
    hospital: {
      costPerPoint: 350,
      triggerHealth: 85
    },
    delivery: {
      cost: 15,
      bonusRange: [10, 50],
      healthRisk: [1, 3]  // 每次送外卖减少 1-3 点健康值
    },
    constructionSite: {
      incomeRange: [300, 500],  // 打工收入 300-500 元
      healthLoss: [2, 5],  // 正常健康减少 2-5 点
      injuryRisk: 15,  // 15% 的受伤风险
      injuryDamage: [50, 100]  // 受伤时健康减少 50-100 点
    },
    house: {
      expansionCost: 30000,
      discountThreshold: 30000,
      capacityIncrease: 10
    }
  },
  transportation: {
    train: {
      beijingShanghai: 500,
      beijingGuangzhou: 800,
      shanghaiGuangzhou: 600
    },
    plane: {
      beijingShanghai: 1200,
      beijingGuangzhou: 1800,
      shanghaiGuangzhou: 1500
    }
  },
  priceGeneration: {
    defaultLeaveOut: 3,
    finalWeeksLeaveOut: 0,
    transportationHubLeaveOut: 0
  },
  random: {
    commercialRange: 950,
    healthRange: 1000,
    moneyRange: 1000
  },
  dialogs: {
    defaultDepositAmount: 1000,
    defaultWithdrawAmount: 1000,
    quickDebtAmounts: [1000, 5000, 10000],
    percentageOptions: [0.25, 0.5, 0.75, 1.0]
  },
  achievements: {
    persistenceWeeks: 30,
    wealthThreshold: 50000,
    eliteThreshold: 100000
  }
}

