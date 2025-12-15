import type { GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import type { IManager } from '../interfaces/IGameService'
import type { IMessageHandler } from '../interfaces/IMessageHandler'

/**
 * 管理器基类
 * 提供通用的功能和依赖注入
 */
export abstract class BaseManager implements IManager {
  constructor(
    public readonly state: GameState,
    public readonly config: GameConfig,
    protected readonly messageHandler: IMessageHandler
  ) {}

  protected showMessage(message: string): void {
    this.messageHandler.show(message)
  }
}
