import { ref, onMounted } from 'vue'
// @ts-expect-error virtual module provided by Vite PWA plugin
import { useRegisterSW } from 'virtual:pwa-register/vue'

// BeforeInstallPromptEvent 类型定义
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const installPrompt = ref<BeforeInstallPromptEvent | null>(null)
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const showInstallPrompt = ref(false)

  // PWA 更新注册
  const {
    needRefresh,
    updateServiceWorker
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('[PWA] Service Worker 已注册:', r)
    },
    onRegisterError(error: unknown) {
      console.error('[PWA] Service Worker 注册失败:', error)
    },
    onNeedRefresh() {
      console.log('[PWA] 需要更新')
    },
    onOfflineReady() {
      console.log('[PWA] 应用已准备离线使用')
    }
  })

  // 检查是否已安装
  const checkInstalled = () => {
    const nav = window.navigator as Navigator & { standalone?: boolean }
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || nav.standalone
    if (isStandalone) {
      isInstalled.value = true
      return true
    }
    return false
  }

  // 监听安装提示
  onMounted(() => {
    checkInstalled()

    // 监听 beforeinstallprompt 事件
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      installPrompt.value = e as BeforeInstallPromptEvent
      isInstallable.value = true
      showInstallPrompt.value = true
    })

    // 监听应用安装事件
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      isInstallable.value = false
      showInstallPrompt.value = false
      installPrompt.value = null
      console.log('[PWA] 应用已安装')
    })
  })

  // 安装应用
  const install = async () => {
    if (!installPrompt.value) {
      return false
    }

    try {
      const result = await installPrompt.value.prompt()
      console.log('[PWA] 安装提示结果:', result)
      
      if (result.outcome === 'accepted') {
        isInstalled.value = true
        isInstallable.value = false
        showInstallPrompt.value = false
      }
      
      installPrompt.value = null
      return result.outcome === 'accepted'
    } catch (error) {
      console.error('[PWA] 安装失败:', error)
      return false
    }
  }

  // 更新应用
  const update = async () => {
    try {
      await updateServiceWorker(true)
      return true
    } catch (error) {
      console.error('[PWA] 更新失败:', error)
      return false
    }
  }

  return {
    installPrompt,
    isInstallable,
    isInstalled,
    showInstallPrompt,
    needRefresh,
    install,
    update,
    checkInstalled
  }
}
