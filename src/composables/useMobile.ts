import { ref, onMounted, onUnmounted } from 'vue'

export function useMobile() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isSmallMobile = ref(false)
  const windowWidth = ref(0)

  const updateBreakpoint = () => {
    windowWidth.value = window.innerWidth
    isSmallMobile.value = windowWidth.value < 375
    isMobile.value = windowWidth.value < 768
    isTablet.value = windowWidth.value >= 768 && windowWidth.value < 1024
  }

  onMounted(() => {
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    window.addEventListener('orientationchange', updateBreakpoint)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateBreakpoint)
    window.removeEventListener('orientationchange', updateBreakpoint)
  })

  return {
    isMobile,
    isTablet,
    isSmallMobile,
    windowWidth
  }
}

