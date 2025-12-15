<template>
  <el-drawer
    v-model="drawerVisible"
    title="📦 我的商品库存"
    :size="isMobile ? '90%' : '500px'"
    direction="rtl"
  >
    <div v-if="ownedGoods.length === 0" class="text-center py-6 text-gray-500 text-sm">
      <p>你目前没有持有任何商品</p>
    </div>
    <div v-else class="inventory-grid">
      <div
        v-for="goods in ownedGoods"
        :key="goods.id"
        :class="[
          'inventory-item rounded-lg border bg-white dark:bg-gray-800 transition-all shadow-sm',
          goods.price > 0 ? 'cursor-pointer hover:shadow-md hover:border-green-300 dark:hover:border-green-500' : 'opacity-70'
        ]"
        @click="goods.price > 0 && handleSell(goods.id)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-lg">{{ getGoodsIcon(goods.name) }}</span>
            <div class="flex flex-col min-w-0">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{{ goods.name }}</h3>
              <div class="flex items-center gap-2 text-[12px] text-gray-500">
                <span>数量 {{ goods.owned }}</span>
              </div>
            </div>
          </div>
          <el-tag
            v-if="goods.price > 0"
            type="success"
            effect="light"
            size="small"
            class="!text-xs !h-6 font-semibold"
          >
            {{ goods.price.toLocaleString() }} 元/件
          </el-tag>
          <el-tag
            v-else
            type="warning"
            size="small"
            effect="light"
            class="!text-xs !h-6 font-semibold"
          >
            暂不可售
          </el-tag>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Money } from '@element-plus/icons-vue'
import { useGameStore } from '@/stores/game'
import { useMobile } from '@/composables/useMobile'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'sell': [goodsId: number]
}>()

const gameStore = useGameStore()
const { isMobile } = useMobile()

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const ownedGoods = computed(() => {
  return gameStore.gameState.goods.filter(g => g.owned > 0)
})

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

const handleSell = (goodsId: number) => {
  emit('sell', goodsId)
}

const open = () => {
  drawerVisible.value = true
}

defineExpose({
  open
})
</script>

<style scoped>
.inventory-item {
  transition: all 0.18s ease;
  padding: 10px 12px;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 8px;
}

@media (min-width: 768px) {
  .inventory-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
