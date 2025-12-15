import type { MarketInfo, MarketGoodsInfo } from '../managers/MarketManager'

/**
 * 市场格式化器
 * 负责格式化市场相关的显示内容
 */
export class MarketFormatter {
  /**
   * 获取商品图标
   */
  getGoodsIcon(goodsName: string): string {
    const iconMap: Record<string, string> = {
      '进口香烟': '🚬',
      '走私汽车': '🚗',
      '潮玩手办': '🎮',
      '山西假白酒': '🍷',
      '《上海小宝贝》': '📚',
      '《岭南文化》': '📚',
      '进口玩具': '🧸',
      '水货手机': '📱',
      '伪劣化妆品': '💄',
      '广式点心': '🥟',
      '进口电子产品': '💻',
      '服装批发': '👔',
      '茶叶': '🍵',
      '进口水果': '🍎',
      '手机配件': '🔌',
      '中药材': '🌿'
    }
    return iconMap[goodsName] || '📦'
  }

  /**
   * 获取商品状态图标
   */
  getStatusIcon(status: MarketGoodsInfo['status']): string {
    switch (status) {
      case 'available':
        return '✅'
      case 'insufficient_funds':
        return '💰'
      case 'insufficient_space':
        return '📦'
      default:
        return '❓'
    }
  }

  /**
   * 获取商品状态文本
   */
  getStatusText(status: MarketGoodsInfo['status']): string {
    switch (status) {
      case 'available':
        return ''
      case 'insufficient_funds':
        return ' (资金不足)'
      case 'insufficient_space':
        return ' (仓库已满)'
      default:
        return ''
    }
  }

  /**
   * 格式化市场显示文本
   * 不包含状态提示（资金不足、仓库已满等）
   */
  formatMarketText(marketInfo: MarketInfo): string {
    if (marketInfo.isEmpty) {
      return '🏪 本周商品市场：\n\n暂无商品（所有商品价格均为0）。'
    }

    let marketText = '🏪 本周商品市场：\n\n'
    marketInfo.availableGoods.forEach(info => {
      const icon = this.getGoodsIcon(info.goods.name)
      marketText += `${icon} ${info.goods.name}: ${info.goods.price.toLocaleString()}元\n`
    })

    return marketText
  }
}
