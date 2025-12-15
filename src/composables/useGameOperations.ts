import { ElMessage } from 'element-plus'
import type { Ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { gameConfig } from '@/config/game.config'
import type { ChatMessage } from './useGameChat'
import type { GameState, Goods } from '@/types/game'

export function useGameOperations(
  gameState: Ref<GameState>,
  addMessage: (msg: ChatMessage, stream?: boolean) => void
) {
  const gameStore = useGameStore()

  const buyGoods = (goodsId: number, quantity: number = 1) => {
    // goodsId 现在是全局唯一的ID，需要通过 id 属性查找商品
    const goods = gameState.value.goods.find((g: Goods) => g.id === goodsId)
    if (!goods) {
      ElMessage.error('商品不存在！')
      return
    }
    
    if (gameStore.buyGoods(goodsId, quantity)) {
      ElMessage.success(`成功购买 ${quantity}件${goods.name}，花费 ${goods.price * quantity}元！`)
    } else {
      ElMessage.error('购买失败：资金或仓库容量不足！')
    }
  }

  const sellGoods = (goodsId: number, quantity: number = 1) => {
    // goodsId 现在是全局唯一的ID，需要通过 id 属性查找商品
    const goods = gameState.value.goods.find((g: Goods) => g.id === goodsId)
    if (!goods) {
      ElMessage.error('商品不存在！')
      return
    }
    
    if (gameStore.sellGoods(goodsId, quantity)) {
      ElMessage.success(`成功出售 ${quantity}件${goods.name}，获得 ${goods.price * quantity}元！`)
    } else {
      ElMessage.error('出售失败：没有足够的商品！')
    }
  }

  const hospitalTreatment = (points: number) => {
    if (gameStore.hospitalTreatment(points)) {
      const cost = points * (gameConfig.buildings.hospital.costPerPoint ?? 350)
      ElMessage.success(`治疗成功！恢复 ${points} 点健康，花费 ${cost.toLocaleString()}元。`)
    } else {
      ElMessage.error('治疗失败：资金不足或健康已满！')
    }
  }

  /**
   * 显示打工工作类型选择菜单（从配置中读取）
   */
  const showWorkTypeMenu = () => {
    // 检查健康值是否过低
    if (gameState.value.health <= 0) {
      ElMessage.error('健康值过低，无法打工！请先去医院治疗。')
      addMessage({
        type: 'system',
        content: '❌ 健康值过低，无法打工。请先去医院治疗恢复健康！',
        icon: '❌'
      })
      return
    }

    // 从 BuildingManager 获取可用的工作类型
    const workTypes = gameStore.buildingManager.getWorkTypes()
    
    if (workTypes.length === 0) {
      ElMessage.warning('当前没有可用的工作类型')
      return
    }

    const options = workTypes.map(workType => {
      const incomeText = `${workType.incomeRange[0]}-${workType.incomeRange[1]}元`
      const staminaText = `体力${workType.staminaCostRange[0]}-${workType.staminaCostRange[1]}点`
      const costText = workType.cost ? `，押金${workType.cost}元` : ''
      const limitText = workType.dailyLimit ? `，每日限${workType.dailyLimit}次` : ''
      
      // 检查是否可用
      let disabled = false
      if (workType.cost && workType.cost > 0) {
        disabled = gameState.value.cash < workType.cost
      }
      if (workType.dailyLimit && workType.dailyLimit > 0) {
        const visitCount = gameState.value.workVisits[workType.id] || 0
        disabled = disabled || visitCount >= workType.dailyLimit
      }

      return {
        label: `${workType.icon} ${workType.name} - ${workType.description}（收入${incomeText}，${staminaText}${costText}${limitText}）`,
        action: 'work-type',
        data: { type: workType.id },
        disabled
      }
    })

    addMessage({
      type: 'system',
      content: '💼 选择你想做的工作类型：',
      icon: '💼',
      options
    }, true)
  }

  /**
   * 执行工作
   * @param workTypeId 工作类型ID
   */
  const doWork = (workTypeId: string = 'construction') => {
    if (gameState.value.health <= 0) {
      ElMessage.error('健康值过低，无法打工！请先去医院治疗。')
      addMessage({
        type: 'system',
        content: '❌ 健康值过低，无法打工。请先去医院治疗恢复健康！',
        icon: '❌'
      })
      return
    }

    if (!gameStore.doWork(workTypeId)) {
      ElMessage.error('无法打工！')
      addMessage({
        type: 'system',
        content: '❌ 无法打工！',
        icon: '❌'
      })
    }
  }


  /**
   * 显示房型选择菜单
   */
  const showHouseTypeMenu = () => {
    const houseTypes = gameStore.buildingManager.getHouseTypes()
    
    if (houseTypes.length === 0) {
      ElMessage.warning('当前没有可用的房型')
      return
    }

    // 检查当前城市是否已租房
    const currentRentedHouse = gameStore.buildingManager.getCurrentCityRentedHouseType()
    const currentCity = gameState.value.currentCity

    const options = houseTypes.map(houseType => {
      // 检查是否首次在该城市租房
      const isFirstTime = !gameState.value.rentedCities?.includes(gameState.value.currentCity)

      // 动态计算月租
      const actualMonthlyRent = gameStore.buildingManager.calculateMonthlyRent?.(
        gameState.value.currentCity, 
        houseType
      ) || houseType.monthlyRent
      
      // 计算押金：一个月月租
      let deposit = actualMonthlyRent
      
      // 如果达到折扣阈值，押金打5折
      if (houseType.discountThreshold && gameState.value.cash >= houseType.discountThreshold) {
        deposit = Math.floor(deposit / 2)
      }

      const discountText = deposit < actualMonthlyRent ? '（享受折扣）' : ''
      const canAfford = gameState.value.cash >= deposit
      
      // 如果已租此房型，标记为已租
      const isRented = currentRentedHouse?.id === houseType.id
      const rentedText = isRented ? '【已租】' : ''
      return {
        label: `${houseType.icon} ${houseType.name}${rentedText} - ${houseType.description}（押金：${deposit.toLocaleString()}元${discountText}，月租：${actualMonthlyRent.toLocaleString()}元）`,
        action: 'house-rent',
        data: { houseTypeId: houseType.id },
        disabled: !canAfford
      }
    })

    // 获取当前已租房型的实际月租
    const currentMonthlyRent = currentRentedHouse 
      ? (gameStore.buildingManager.getCurrentCityRentedHouseMonthlyRent?.() || currentRentedHouse.monthlyRent)
      : 0

    const headerText = currentRentedHouse
      ? `🏠 选择你想租的房型（当前已租：${currentRentedHouse.icon} ${currentRentedHouse.name}，月租${currentMonthlyRent.toLocaleString()}元）：`
      : '🏠 选择你想租的房型（每月需支付月租）：'

    addMessage({
      type: 'system',
      content: headerText,
      icon: '🏠',
      options
    }, true)
  }

  /**
   * 租房
   * @param houseTypeId 房型ID
   */
  const rentHouse = (houseTypeId: string) => {
    if (gameStore.rentHouse(houseTypeId)) {
      // 消息已在 BuildingManager 中显示
    } else {
      ElMessage.error('租房失败！')
    }
  }

  const eatAtRestaurant = () => {
    if (!gameStore.eatAtRestaurant()) {
      // 具体失败原因（钱不够 / 城市未开放饭店等）在 BuildingManager 中已经展示，这里不重复提示
    }
  }

  const takeSubway = (target: 'train' | 'airport') => {
    if (gameStore.takeSubway(target)) {
      // 具体到火车站/机场后的跨城选择，由上层逻辑继续处理
    }
  }

  return {
    buyGoods,
    sellGoods,
    hospitalTreatment,
    doWork,
    showWorkTypeMenu,
    eatAtRestaurant,
    showHouseTypeMenu,
    rentHouse,
    takeSubway
  }
}

