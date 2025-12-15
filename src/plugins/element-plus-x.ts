/**
 * Element Plus X 配置
 * 企业级 AI 组件库配置
 */
import type { App } from 'vue'

/**
 * 配置 Element Plus X
 * 注意：如果使用按需导入，则无需全局注册
 * 组件会自动按需导入
 */
export function setupElementPlusX(_app?: App): void {
  // Element Plus X 使用按需导入，无需全局注册
  // 如果需要全局注册，可以取消下面的注释：
  // import ElementPlusX from 'vue-element-plus-x'
  // _app?.use(ElementPlusX)
}

/**
 * Element Plus X 组件列表
 * 常用的 AI 组件：
 * - BubbleList: 气泡列表（聊天消息）
 * - Sender: 发送器组件
 * - ChatWindow: 聊天窗口
 * - AIAssistant: AI 助手组件
 * - Thinking: 思考状态指示器
 */
export const elementPlusXComponents = [
  'BubbleList',
  'Sender',
  'ChatWindow',
  'AIAssistant',
  'Thinking'
] as const
