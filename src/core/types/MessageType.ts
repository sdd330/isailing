/**
 * 消息类型枚举
 * 用于明确标识消息的显示位置和类型
 */
export enum MessageType {
  /** 系统消息 - 显示在对话中 */
  SYSTEM = 'system',
  /** 健康事件 - 显示在 Header */
  HEALTH_EVENT = 'health_event',
  /** 商业事件 - 显示在 Header */
  COMMERCIAL_EVENT = 'commercial_event',
  /** 金钱事件 - 显示在 Header（包括盈利和亏损） */
  MONEY_EVENT = 'money_event'
}

/**
 * 消息选项
 */
export interface MessageOptions {
  /** 消息类型 */
  type: MessageType
  /** 图标（可选） */
  icon?: string
}

