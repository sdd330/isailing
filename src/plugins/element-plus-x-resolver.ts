/**
 * Element Plus X 自定义 Resolver
 * 用于 unplugin-vue-components 自动导入
 */
import type { ComponentResolver } from 'unplugin-vue-components/types'

/**
 * Element Plus X 组件映射
 * 根据实际组件名称进行映射
 */
const elementPlusXComponents = [
  'BubbleList',
  'Sender',
  'ChatWindow',
  'AIAssistant',
  'ChatBubble',
  'MessageList',
  'Thinking'
]

/**
 * Element Plus X Resolver
 */
export function ElementPlusXResolver(): ComponentResolver {
  return {
    type: 'component',
    resolve: (name: string) => {
      // 检查是否是 Element Plus X 组件
      if (elementPlusXComponents.includes(name)) {
        return {
          name,
          from: 'vue-element-plus-x'
        }
      }
    }
  }
}
