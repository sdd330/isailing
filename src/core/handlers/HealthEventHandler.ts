import type { HealthEvent } from '@/types/game'
import type { GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import type { IMessageHandler, ISoundPlayer } from '../interfaces/IMessageHandler'
import { Random } from '../utils/Random'
import { debugLog } from '../../utils/debug'

export class HealthEventHandler {
  constructor(
    private state: GameState,
    private config: GameConfig,
    private events: HealthEvent[],
    private messageHandler: IMessageHandler,
    private soundPlayer: ISoundPlayer
  ) {}

  process(): void {
    for (const event of this.events) {
      const randomNum = Random.num(this.config.random.healthRange)
      if (randomNum % event.freq === 0) {
        this.state.health -= event.damage
        if (this.state.health < 0) this.state.health = 0
        const message = `${event.message}，健康-${event.damage}`
        debugLog('[HealthEvent] 触发事件:', message, '随机数:', randomNum, 'freq:', event.freq)
        this.messageHandler.show(message)
        this.soundPlayer.play(event.sound)
        return
      }
    }
  }
}

