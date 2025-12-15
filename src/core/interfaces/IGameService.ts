import type { GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'

/**
 * 游戏服务基接口
 * 所有游戏服务都应该实现此接口
 */
export interface IGameService {
  readonly state: GameState
  readonly config: GameConfig
}

/**
 * 管理器基接口
 * 所有管理器都应该实现此接口
 */
export interface IManager extends IGameService {
  initialize?(): void
  reset?(): void
}
