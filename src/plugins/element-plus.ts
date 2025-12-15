/**
 * Element Plus 配置
 * 统一管理 Element Plus 的主题和全局配置
 */
import type { App } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

/**
 * 配置 Element Plus 全局属性
 */
export function setupElementPlus(app: App) {
  // 全局配置
  app.config.globalProperties.$message = ElMessage
  app.config.globalProperties.$msgbox = ElMessageBox
  app.config.globalProperties.$alert = ElMessageBox.alert
  app.config.globalProperties.$confirm = ElMessageBox.confirm
  app.config.globalProperties.$prompt = ElMessageBox.prompt
  app.config.globalProperties.$notify = ElNotification
}

/**
 * Element Plus 默认配置
 */
export const elementPlusConfig = {
  size: 'default' as const,
  zIndex: 3000,
  locale: undefined
}
