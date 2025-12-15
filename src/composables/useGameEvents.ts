import { ref } from 'vue'
import { gameConfig } from '@/config/game.config'

export interface TimeEvent {
  icon: string
  message: string
  type: 'price' | 'health' | 'reward' | 'loss' | 'other'
}

export function useGameEvents() {
  const timeEvents = ref<TimeEvent[]>([])

  const addEvent = (message: string) => {
    let icon = '💬'
    let eventType: TimeEvent['type'] = 'other'

    if (message.includes('价格') || message.includes('×') || message.includes('÷') || 
        message.includes('上涨') || message.includes('下跌')) {
      icon = '📈'
      eventType = 'price'
    } else if (message.includes('打了') || message.includes('追') || message.includes('交通') || 
               message.includes('耳光') || message.includes('电击') || message.includes('熏') || 
               message.includes('嘲笑') || message.includes('高温') || message.includes('沙尘暴') || 
               message.includes('砸') || message.includes('流氓') || message.includes('地道') || 
               message.includes('工商局') || message.includes('小巴') || message.includes('民工') || 
               message.includes('保安') || message.includes('臭河') || message.includes('大婶') || 
               message.includes('申奥') || message.includes('青年')) {
      icon = '⚠️'
      eventType = 'health'
    } else if (message.includes('赠送') || message.includes('资助') || 
               message.includes('老同学') || message.includes('老乡') || message.includes('留下')) {
      icon = '🎁'
      eventType = 'reward'
    } else if (message.includes('被偷') || message.includes('被抢') || message.includes('老太太') || 
               message.includes('拦住') || message.includes('别挤') || message.includes('红袖章') || 
               message.includes('长话费') || message.includes('上网费') || message.includes('经商证') || 
               message.includes('氧吧') || message.includes('被讨债')) {
      icon = '💸'
      eventType = 'loss'
    } else if (message.includes('强制') || message.includes(`最后${gameConfig.time.unit}`)) {
      icon = '🔔'
      eventType = 'other'
    }

    timeEvents.value.push({ icon, message, type: eventType })

    if (timeEvents.value.length > 5) {
      timeEvents.value.shift()
    }
  }

  const clearEvents = () => {
    timeEvents.value = []
  }

  const isRandomEvent = (message: string): boolean => {
    // 系统消息（不应该显示在Header）
    const isSystemMessage = 
      (message.includes('第') && message.includes(gameConfig.time.unit) && message.includes('开始')) ||
      message.includes('本' + gameConfig.time.unit + '状态') ||
      message.includes('现金:') ||
      message.includes('债务:') ||
      message.includes('银行存款:') ||
      message.includes('健康:') ||
      message.includes('仓库:') ||
      message.includes('剩余时间:') ||
      message.includes('购买成功') ||
      message.includes('出售成功') ||
      message.includes('购买失败') ||
      message.includes('出售失败') ||
      message.includes('存款成功') ||
      message.includes('取款成功') ||
      message.includes('治疗成功') ||
      message.includes('还债成功') ||
      message.includes('送外卖成功') ||
      message.includes('工地打工') ||
      message.includes('扩建成功') ||
      message.includes('欢迎来到') ||
      message.includes('操作提示') ||
      message.includes('选择你想') ||
      message.includes('银行服务') ||
      message.includes('医院治疗') ||
      (message.includes('邮局') && !message.includes('邮局扫荡')) ||
      (message.includes('黑市') && !message.includes('价格')) ||
      message.includes('库存') ||
      message.includes('建筑服务') ||
      message.includes('成功乘坐') ||
      (message.includes('前往') && message.includes('花费')) ||
      message.includes('✅') ||
      (message.includes('🏪') && !message.includes('价格')) ||
      message.includes('📦') ||
      message.includes('🏢') ||
      message.includes('📊') ||
      message.includes('🎮')

    if (isSystemMessage) {
      return false
    }

    // 随机事件特征（应该显示在Header）
    const hasEventKeywords = 
      message.includes('价格') || 
      message.includes('×') || 
      message.includes('÷') ||
      message.includes('涨到') ||
      message.includes('跌到') ||
      message.includes('上涨') || 
      message.includes('下跌') ||
      message.includes('打了') || 
      message.includes('追') || 
      message.includes('交通') ||
      message.includes('耳光') || 
      message.includes('电击') || 
      message.includes('熏') ||
      message.includes('嘲笑') || 
      message.includes('高温') || 
      message.includes('沙尘暴') ||
      message.includes('砸') || 
      message.includes('被偷') || 
      message.includes('被抢') ||
      message.includes('赠送') || 
      message.includes('资助') || 
      message.includes('强制') ||
      message.includes('流氓') || 
      message.includes('地道') || 
      message.includes('工商局') ||
      message.includes('小巴') || 
      message.includes('民工') || 
      message.includes('保安') ||
      message.includes('臭河') || 
      message.includes('大婶') || 
      message.includes('申奥') ||
      message.includes('青年') || 
      message.includes('日本') || 
      message.includes('老同学') ||
      message.includes('老乡') || 
      message.includes('老太太') || 
      message.includes('拦住') ||
      message.includes('别挤') || 
      message.includes('红袖章') || 
      message.includes('长话费') ||
      message.includes('上网费') || 
      message.includes('经商证') || 
      message.includes('氧吧') ||
      message.includes('被讨债') || 
      message.includes('健康-') ||
      message.includes('现金减少') ||
      message.includes('存款减少') ||
      message.includes('获得') ||
      message.includes('债务+') ||
      message.includes('赚了') ||
      message.includes('损失了') ||
      message.includes('彩票') ||
      message.includes('炒股') ||
      message.includes('网恋') ||
      message.includes('诈骗') ||
      message.includes('P2P') ||
      message.includes('众筹') ||
      message.includes(`最后${gameConfig.time.unit}`)

    return hasEventKeywords
  }

  return {
    timeEvents,
    addEvent,
    clearEvents,
    isRandomEvent
  }
}

