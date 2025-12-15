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
      const cost = points * gameConfig.buildings.hospital.costPerPoint
      ElMessage.success(`治疗成功！恢复 ${points} 点健康，花费 ${cost.toLocaleString()}元。`)
    } else {
      ElMessage.error('治疗失败：资金不足或健康已满！')
    }
  }

  const visitDelivery = () => {
    const visitCount = gameState.value.deliveryVisits || 0
    if (visitCount >= 4) {
      ElMessage.warning('今天送外卖次数已达上限！')
      addMessage({
        type: 'system',
        content: '🛵 今天送外卖次数已达上限，明天再来吧！',
        icon: '🛵'
      })
      return
    }
    
    if (gameStore.visitDelivery()) {
      // 消息已在 BuildingManager 中显示，包含健康值变化信息
      // 这里不需要重复显示消息
    } else {
      const errorMsg = gameState.value.health <= 0 
        ? '健康值过低，无法送外卖！请先去医院治疗。'
        : `资金不足，无法送外卖！需要${gameConfig.buildings.delivery.cost}元。`
      
      ElMessage.error(errorMsg)
      addMessage({
        type: 'system',
        content: gameState.value.health <= 0
          ? '❌ 健康值过低，无法送外卖。送外卖会消耗体力，请先去医院治疗恢复健康！'
          : `❌ 资金不足，无法送外卖。需要${gameConfig.buildings.delivery.cost}元，去取钱吧！`,
        icon: '❌'
      })
    }
  }

  const visitConstructionSite = () => {
    // 检查健康值是否过低
    if (gameState.value.health <= 0) {
      ElMessage.error('健康值过低，无法去工地打工！请先去医院治疗。')
      addMessage({
        type: 'system',
        content: '❌ 健康值过低，无法去工地打工。工地工作有风险，请先去医院治疗恢复健康！',
        icon: '❌'
      })
      return
    }

    if (gameStore.visitConstructionSite()) {
      // 消息已在 BuildingManager 中显示，包含健康值变化信息
      // 这里不需要重复显示消息
    } else {
      ElMessage.error('无法去工地打工！')
      addMessage({
        type: 'system',
        content: '❌ 无法去工地打工！',
        icon: '❌'
      })
    }
  }

  const expandHouse = () => {
    if (gameStore.expandHouse()) {
      ElMessage.success(`房屋扩建成功！仓库容量增加${gameConfig.buildings.house.capacityIncrease}。`)
      addMessage({
        type: 'system',
        content: `🏠 房屋扩建成功！仓库容量+${gameConfig.buildings.house.capacityIncrease}`,
        icon: '🏠'
      })
    } else {
      ElMessage.error('资金不足，无法扩建房屋！')
      addMessage({
        type: 'system',
        content: '❌ 资金不足，无法扩建房屋',
        icon: '❌'
      })
    }
  }

  return {
    buyGoods,
    sellGoods,
    hospitalTreatment,
    visitDelivery,
    visitConstructionSite,
    expandHouse
  }
}

