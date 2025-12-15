<template>
  <el-drawer
    v-model="drawerVisible"
    title="🏪 本周商品市场"
    :size="isMobile ? '90%' : '500px'"
    direction="rtl"
  >
    <div v-if="marketInfo.isEmpty" class="text-center py-6 text-gray-500 text-sm">
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
        @click="info.canBuy && handleBuy(info.goods.id)"
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
          >
            {{ info.goods.price.toLocaleString() }} 元
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
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ShoppingCart } from '@element-plus/icons-vue'
import { useGameStore } from '@/stores/game'
import { availableCities, shanghaiTheme } from '@/config/theme.config'
import { useMobile } from '@/composables/useMobile'
import type { MarketInfo } from '@/core/managers/MarketManager'

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

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const marketInfo = computed<MarketInfo>(() => {
  const theme = getCurrentCityTheme()
  return gameStore.marketManager.getMarketInfo(theme)
})

const getCurrentCityTheme = () => {
  const cityInfo = availableCities.find(c => c.name === gameStore.gameState.currentCity)
  return cityInfo?.theme || availableCities[0]?.theme || shanghaiTheme
}

const getGoodsIcon = (goodsName: string): string => {
  const iconMap: Record<string, string> = {
    '进口香烟': '🚬',
    '走私汽车': '🚗',
    '潮玩手办': '🎮',
    '山西假白酒': '🍷',
    '《上海小宝贝》': '📚',
    '《岭南文化》': '📚',
    '进口玩具': '🧸',
    '水货手机': '📱',
    '伪劣化妆品': '💄',
    '广式点心': '🥟',
    '进口电子产品': '💻',
    '服装批发': '👔',
    '茶叶': '🍵',
    '进口水果': '🍎',
    '手机配件': '🔌',
    '中药材': '🌿'
  }
  return iconMap[goodsName] || '📦'
}

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
