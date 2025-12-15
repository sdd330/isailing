import type { GameState } from '@/types/game'
import type { IMessageHandler } from '../interfaces/IMessageHandler'

/**
 * 名声服务
 * 负责处理名声相关的逻辑
 */
export class FameService {
  constructor(
    private state: GameState,
    private messageHandler: IMessageHandler
  ) {}

  /**
   * 更新出售商品后的名声
   */
  updateFameForSelling(goodsName: string, quantity: number): void {
    const fameLoss = this.calculateFameLoss(goodsName, quantity)
    
    if (fameLoss > 0) {
      this.state.fame -= fameLoss
      if (this.state.fame < 0) {
        this.state.fame = 0
      }
      this.messageHandler.show(this.getFameLossMessage(goodsName, fameLoss))
    }
  }

  /**
   * 计算名声损失
   */
  private calculateFameLoss(goodsName: string, quantity: number): number {
    if (goodsName.includes('小宝贝') || goodsName.includes('上海小宝贝') || goodsName.includes('风云')) {
      return 7 * quantity
    }
    if (goodsName.includes('假白酒') || goodsName.includes('假酒') || goodsName.includes('白酒')) {
      return 10 * quantity
    }
    return 0
  }

  /**
   * 获取名声损失消息
   */
  private getFameLossMessage(goodsName: string, fameLoss: number): string {
    if (goodsName.includes('小宝贝') || goodsName.includes('上海小宝贝') || goodsName.includes('风云')) {
      return `出售${goodsName}，污染社会，名声下降${fameLoss}点！`
    }
    if (goodsName.includes('假白酒') || goodsName.includes('假酒') || goodsName.includes('白酒')) {
      return `出售${goodsName}，危害社会，名声下降${fameLoss}点！`
    }
    return ''
  }
}
