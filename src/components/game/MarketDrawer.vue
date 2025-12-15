<template>
  <el-drawer
    v-model="drawerVisible"
    title="🏪 黑市"
    :size="isMobile ? '90%' : '500px'"
    direction="rtl"
  >
    <el-tabs v-model="activeTab" class="market-tabs">
      <el-tab-pane label="🏪 黑市交易" name="goods">
        <div v-if="noMarketHere" class="text-center py-6 text-gray-500 text-sm">
          <p>当前地点没有黑市，请先乘地铁前往有黑市的商业区。</p>
        </div>
        <div v-else-if="marketInfo.isEmpty" class="text-center py-6 text-gray-500 text-sm">
          <p>暂无商品（所有商品价格均为0）</p>
        </div>
        <div v-else class="market-grid">
      <div
        v-for="info in marketInfo.availableGoods"
        :key="info.goods.id"
        :class="[
          'market-item rounded-lg border bg-white dark:bg-gray-800 transition-all shadow-sm',
          info.canBuy ? 'cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500' : 'opacity-70'
        ]"
        @click="info.canBuy && handleItemClick(info)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-lg">{{ getGoodsIcon(info.goods.name) }}</span>
            <div class="flex flex-col min-w-0">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{{ info.goods.name }}</h3>
              <div class="flex items-center gap-1 text-[12px] text-gray-500">
                <span>{{ getStatusText(info.status) }}</span>
                <span>{{ getStatusIcon(info.status) }}</span>
              </div>
            </div>
          </div>
          <el-tag
            v-if="info.goods.price > 0"
            :type="getStatusTagType(info.status)"
            effect="light"
            size="small"
            class="!text-xs !h-6 font-semibold"
            :class="{ 'opacity-50': isProcessing }"
          >
            <span v-if="isProcessing && info.canBuy" class="inline-flex items-center">
              <el-icon class="animate-spin mr-1"><Loading /></el-icon>
              处理中...
            </span>
            <span v-else>
              {{ info.goods.price.toLocaleString() }} 元
            </span>
          </el-tag>
          <el-tag
            v-else
            type="warning"
            size="small"
            effect="light"
            class="!text-xs !h-6 font-semibold"
          >
            不可购买
          </el-tag>
        </div>
      </div>
    </div>
      </el-tab-pane>
      <el-tab-pane label="🎯 黑市预测" name="prediction">
        <PredictionMarketPanel />
      </el-tab-pane>
    </el-tabs>

    <!-- 快捷键提示 -->
    <div class="mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-500 text-center">
      <span>快捷键：1-商品交易 | 2-黑市预测 | ESC-关闭</span>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { getCity, getCityKeyByName } from '@/config/theme.config'
import { useMobile } from '@/composables/useMobile'
import type { MarketInfo } from '@/core/managers/MarketManager'
import PredictionMarketPanel from './prediction/PredictionMarketPanel.vue'
import { getGoodsIcon } from '@/config/goodsIcons.config'
import { ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'buy': [goodsId: number]
}>()

const gameStore = useGameStore()
const { isMobile } = useMobile()
const activeTab = ref('goods')
const isProcessing = ref(false)

// 键盘快捷键处理
const handleKeydown = (event: KeyboardEvent) => {
  if (!drawerVisible.value) return

  // 只有在没有其他输入框聚焦时才响应快捷键
  const activeElement = document.activeElement
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    return
  }

  switch (event.key.toLowerCase()) {
    case '1':
      activeTab.value = 'goods'
      break
    case '2':
      activeTab.value = 'prediction'
      break
    case 'escape':
      drawerVisible.value = false
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) {
      // 关闭时重置处理状态
      isProcessing.value = false
    }
    emit('update:modelValue', value)
  }
})

const hasMarketHere = computed(() => {
  const currentLocationId = gameStore.gameState.currentLocation
  const theme = getCurrentCityTheme()
  if (!theme) return false

  const locations = Array.isArray(theme.city.locations)
    ? theme.city.locations as Array<{ id: number; hasMarket?: boolean }>
    : []

  // 没有地点配置时，默认认为可以访问黑市
  if (!locations.length) return true

  const currentLocation = locations.find(l => l.id === currentLocationId)

  // 找不到当前地点时，默认认为可以访问黑市，避免影响旧存档
  if (!currentLocation) return true

  // 如果城市里有任何地点显式标记 hasMarket，则使用精细控制：
  const anyMarked = locations.some(l => l.hasMarket !== undefined)
  if (anyMarked) {
    return currentLocation.hasMarket !== false && currentLocation.hasMarket !== undefined
  }

  // 否则保持旧行为：全城都可以访问黑市
  return true
})

const noMarketHere = computed(() => !hasMarketHere.value)

const marketInfo = computed<MarketInfo>(() => {
  const theme = getCurrentCityTheme()
  if (!theme || !hasMarketHere.value) {
    return {
      availableGoods: [],
      totalAvailable: 0,
      purchasableCount: 0,
      isEmpty: true
    }
  }
  const cityKey = getCityKeyByName(gameStore.gameState.currentCity || '上海')
  const currentCity = getCity(cityKey) || getCity('shanghai')
  const goods = currentCity ? currentCity.getGoods() : []
  const cityGoodsIds = new Set(goods.map(g => g.id))
  return gameStore.marketManager.getMarketInfo(theme.city.name, cityGoodsIds)
})

const getCurrentCityTheme = () => {
  const cityKey = getCityKeyByName(gameStore.gameState.currentCity || '上海')
  const currentCity = getCity(cityKey) || getCity('shanghai')
  if (currentCity) {
    return {
      game: {
        title: `${currentCity.getCityName()}创业记`,
        logo: currentCity.getShortName(),
        logoColor: 'from-blue-500 to-cyan-500',
        description: `${currentCity.getCityName()}创业记`
      },
      city: {
        name: currentCity.getCityName(),
        shortName: currentCity.getShortName(),
        locations: currentCity.getLocations()
      }
    }
  }
  // 默认返回上海
  const shanghaiCity = getCity('shanghai')
  return shanghaiCity ? {
    game: {
      title: `${shanghaiCity.getCityName()}创业记`,
      logo: shanghaiCity.getShortName(),
      logoColor: 'from-blue-500 to-cyan-500',
      description: '魔都创业记'
    },
    city: {
      name: shanghaiCity.getCityName(),
      shortName: shanghaiCity.getShortName(),
      locations: shanghaiCity.getLocations()
    }
  } : null
}

// getGoodsIcon 已从统一的配置中导入

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'available':
      return '✅'
    case 'insufficient_funds':
      return '💰'
    case 'insufficient_space':
      return '📦'
    default:
      return '❓'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'available':
      return '可购买'
    case 'insufficient_funds':
      return '资金不足'
    case 'insufficient_space':
      return '仓库已满'
    default:
      return ''
  }
}

const getStatusTagType = (status: string): string => {
  switch (status) {
    case 'available':
      return 'success'
    case 'insufficient_funds':
      return 'warning'
    case 'insufficient_space':
      return 'danger'
    default:
      return 'info'
  }
}

const handleItemClick = async (info: any) => {
  if (isProcessing.value) return

  try {
    isProcessing.value = true

    // 检查玩家是否已经有这个商品
    const existingGoods = gameStore.gameState.goods.find(g => g.id === info.goods.id)
    const ownedQuantity = existingGoods?.owned || 0

    // 如果玩家已经有这个商品，显示确认对话框
    if (ownedQuantity > 0) {
      const confirmed = await ElMessageBox.confirm(
        `你已经拥有 ${ownedQuantity} 个 ${info.goods.name}，确定还要再买一个吗？`,
        '确认购买',
        {
          confirmButtonText: '确定购买',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      if (!confirmed) return
    }

    // 执行购买
    handleBuy(info.goods.id)

  } catch (error) {
    // 用户取消了操作，不需要处理
  } finally {
    isProcessing.value = false
  }
}

const handleBuy = (goodsId: number) => {
  emit('buy', goodsId)
}

const open = () => {
  drawerVisible.value = true
}

defineExpose({
  open
})
</script>

<style scoped>
.market-tabs {
  height: 100%;
}

.market-tabs :deep(.el-tabs__content) {
  padding: 0;
  height: calc(100% - 55px);
  overflow-y: auto;
}

.market-item {
  transition: all 0.18s ease;
  padding: 10px 12px;
}

.market-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 8px;
}

@media (min-width: 768px) {
  .market-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
