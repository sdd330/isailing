/**
 * 消息处理器接口
 * 用于统一处理游戏中的消息通知
 */
export interface IMessageHandler {
  show(message: string): void
}

/**
 * 声音播放器接口
 * 用于统一处理游戏中的声音播放
 */
export interface ISoundPlayer {
  play(soundFile: string): void
}
