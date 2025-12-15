/**
 * 离线功能工具
 * 提供离线状态检测和离线数据管理
 */

export interface OfflineData {
  gameState?: unknown
  timestamp: number
}

class OfflineManager {
  private storageKey = 'pwa-offline-data'

  /**
   * 检查是否在线
   */
  isOnline(): boolean {
    return navigator.onLine
  }

  /**
   * 监听在线/离线状态变化
   */
  onStatusChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true)
    const handleOffline = () => callback(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 返回清理函数
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  /**
   * 保存离线数据
   */
  saveOfflineData(data: unknown): void {
    try {
      const offlineData: OfflineData = {
        gameState: data,
        timestamp: Date.now()
      }
      localStorage.setItem(this.storageKey, JSON.stringify(offlineData))
      console.log('[Offline] 离线数据已保存')
    } catch (error) {
      console.error('[Offline] 保存离线数据失败:', error)
    }
  }

  /**
   * 获取离线数据
   */
  getOfflineData(): OfflineData | null {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        return JSON.parse(data) as OfflineData
      }
    } catch (error) {
      console.error('[Offline] 获取离线数据失败:', error)
    }
    return null
  }

  /**
   * 清除离线数据
   */
  clearOfflineData(): void {
    try {
      localStorage.removeItem(this.storageKey)
      console.log('[Offline] 离线数据已清除')
    } catch (error) {
      console.error('[Offline] 清除离线数据失败:', error)
    }
  }

  /**
   * 检查 Service Worker 是否可用
   */
  isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator
  }

  /**
   * 获取 Service Worker 注册信息
   */
  async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isServiceWorkerSupported()) {
      return null
    }

    try {
      return (await navigator.serviceWorker.getRegistration()) ?? null
    } catch (error) {
      console.error('[Offline] 获取 Service Worker 注册失败:', error)
      return null
    }
  }
}

export const offlineManager = new OfflineManager()
