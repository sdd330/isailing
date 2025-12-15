import type { HealthEvent } from '@/types/game'
import type { GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import type { IMessageHandler, ISoundPlayer } from '../interfaces/IMessageHandler'
import { Random } from '../utils/Random'
import { debugLog } from '../../utils/debug'
import { getSolarTermForState, isTransitionSeason } from '@/utils/season'

export class HealthEventHandler {
  constructor(
    private state: GameState,
    private config: GameConfig,
    private events: HealthEvent[],
    private messageHandler: IMessageHandler,
    private soundPlayer: ISoundPlayer,
    private checkGameOver?: () => boolean
  ) {}

  process(): void {
    // 基于当前周数计算节气与季节，用于筛选季节性事件
    const term = getSolarTermForState(this.state, this.config)
    const season = term.season
    const isTransition = isTransitionSeason(season)

    for (const event of this.events) {
      // 如果事件配置了季节/节气标签，则只在对应时间段触发
      if (event.tags && event.tags.length > 0) {
        const matchSeason =
          event.tags.includes(season) ||
          event.tags.includes(term.name) ||
          (isTransition && event.tags.includes('transition'))

        if (!matchSeason) {
          continue
        }
      }

      const randomNum = Random.num(this.config.random.healthRange)
      if (randomNum % event.freq === 0) {
        this.state.health -= event.damage
        if (this.state.health < 0) this.state.health = 0
        const message = `${event.message}，健康-${event.damage}`
        debugLog('[HealthEvent] 触发事件:', message, '随机数:', randomNum, 'freq:', event.freq, 'season:', season, 'term:', term.name)
        this.messageHandler.show(message)

        // 检查健康值是否为0导致游戏结束
        if (this.state.health <= 0) {
          // 通知游戏引擎检查游戏结束条件
          this.checkGameOver?.()
        }
        this.soundPlayer.play(event.sound)
        return
      }
    }
  }
}

