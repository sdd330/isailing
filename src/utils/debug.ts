/**
 * 调试工具函数
 * 在生产环境中自动禁用调试日志
 */
const isDevelopment = import.meta.env.DEV

export const debugLog = (...args: unknown[]) => {
  if (isDevelopment) {
    console.log(...args)
  }
}

export const debugError = (...args: unknown[]) => {
  if (isDevelopment) {
    console.error(...args)
  }
}

export const debugWarn = (...args: unknown[]) => {
  if (isDevelopment) {
    console.warn(...args)
  }
}

