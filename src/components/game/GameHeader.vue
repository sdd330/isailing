<template>
  <el-header class="glass-effect border-b border-white/20 px-2 md:px-4 py-2 md:py-3 header-gradient w-full overflow-hidden flex-shrink-0">
    <div :class="['mx-auto', isMobile ? 'w-full px-0' : 'max-w-6xl']">
      <div v-if="isMobile" class="mobile-header-content flex flex-col gap-2">
        <div class="mobile-title-row flex items-center justify-center w-full">
          <div class="flex items-center gap-2">
            <el-avatar v-if="currentTheme.game" :size="32" :class="`bg-gradient-to-br ${currentTheme.game.logoColor} shadow-lg`">
              <span class="text-white text-sm font-bold">{{ currentTheme.game.logo }}</span>
            </el-avatar>
            <h1 class="text-sm font-bold text-gray-800 m-0 text-center">
              魔都i启航 荣耀上海滩 · 剩余 {{ gameState.timeLeft }}{{ timeUnit }}
            </h1>
          </div>
        </div>

        <div class="mobile-stats-row flex items-center justify-between w-full whitespace-nowrap gap-1 overflow-x-auto">
          <el-tag type="success" size="small" class="stat-tag-mobile">
            <span class="mr-1">💰</span>
            <span>{{ formatNumber(gameState.cash) }}</span>
          </el-tag>
          <el-tag type="info" size="small" class="stat-tag-mobile">
            <span class="mr-1">🏦</span>
            <span>{{ formatNumber(gameState.bankSavings) }}</span>
          </el-tag>
          <el-tag type="danger" size="small" class="stat-tag-mobile">
            <span class="mr-1">💸</span>
            <span>{{ formatNumber(gameState.debt) }}</span>
          </el-tag>
          <el-tag type="primary" size="small" class="stat-tag-mobile">
            <span class="mr-1">📦</span>
            <span>{{ gameState.totalGoods }}/{{ gameState.maxCapacity }}</span>
          </el-tag>
          <el-tag :type="gameState.health >= 80 ? 'success' : gameState.health >= 50 ? 'warning' : 'danger'" size="small" class="stat-tag-mobile">
            <span class="mr-1">❤️</span>
            <span>{{ gameState.health }}/100</span>
          </el-tag>
          <el-tag type="warning" size="small" class="stat-tag-mobile">
            <span class="mr-1">⭐</span>
            <span>{{ gameState.fame }}</span>
          </el-tag>
        </div>

        <EventDisplay v-if="timeEvents.length > 0" :events="timeEvents" class="mt-2 flex-shrink-0" />
      </div>

      <div v-else class="flex flex-col gap-2">
        <div class="flex items-center justify-center w-full">
          <div class="flex items-center gap-3">
            <el-avatar v-if="currentTheme.game" :size="48" :class="`bg-gradient-to-br ${currentTheme.game.logoColor} shadow-lg`">
              <span class="text-white text-xl font-bold">{{ currentTheme.game.logo }}</span>
            </el-avatar>
            <h1 class="text-lg font-bold text-gray-800 m-0 text-center">
              魔都i启航 荣耀上海滩 · 剩余 {{ gameState.timeLeft }}{{ timeUnit }}
            </h1>
          </div>
        </div>
        <div class="flex items-center justify-between w-full flex-wrap gap-2">
          <el-tag type="success" size="small" class="stat-tag">
            <span class="mr-1">💰</span>
            <span>{{ formatNumber(gameState.cash) }}</span>
          </el-tag>
          <el-tag type="info" size="small" class="stat-tag">
            <span class="mr-1">🏦</span>
            <span>{{ formatNumber(gameState.bankSavings) }}</span>
          </el-tag>
          <el-tag type="danger" size="small" class="stat-tag">
            <span class="mr-1">💸</span>
            <span>{{ formatNumber(gameState.debt) }}</span>
          </el-tag>
          <el-tag type="primary" size="small" class="stat-tag">
            <span class="mr-1">📦</span>
            <span>{{ gameState.totalGoods }}/{{ gameState.maxCapacity }}</span>
          </el-tag>
          <el-tag :type="gameState.health >= 80 ? 'success' : gameState.health >= 50 ? 'warning' : 'danger'" size="small" class="stat-tag">
            <span class="mr-1">❤️</span>
            <span>{{ gameState.health }}/100</span>
          </el-tag>
          <el-tag type="warning" size="small" class="stat-tag">
            <span class="mr-1">⭐</span>
            <span>{{ gameState.fame }}</span>
          </el-tag>
        </div>
        <EventDisplay v-if="timeEvents.length > 0" :events="timeEvents" class="flex-shrink-0" />
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GameState } from '@/types/game'
import type { TimeEvent } from '@/composables/useGameEvents'
import { gameConfig } from '@/config/game.config'
import { availableCities, shanghaiTheme } from '@/config/theme.config'
import type { ThemeConfig } from '@/config/theme.config'
import { useMobile } from '@/composables/useMobile'
import EventDisplay from './EventDisplay.vue'

interface Props {
  gameState: GameState
  finalScore: number
  timeEvents: TimeEvent[]
}

const props = defineProps<Props>()

const { isMobile } = useMobile()

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

const timeUnit = computed(() => gameConfig?.time?.unit || '周')

const currentTheme = computed<ThemeConfig>(() => {
  try {
    if (!props.gameState || !props.gameState.currentCity) {
      return shanghaiTheme
    }
    
    const cityInfo = availableCities.find(c => c.name === props.gameState.currentCity)
    if (cityInfo && cityInfo.theme && cityInfo.theme.game) {
      return cityInfo.theme
    }
    
    if (availableCities.length > 0 && availableCities[1] && availableCities[1].theme && availableCities[1].theme.game) {
      return availableCities[1].theme
    }
    
    if (shanghaiTheme && shanghaiTheme.game) {
      return shanghaiTheme
    }
    
    throw new Error('No valid theme found')
  } catch {
    return shanghaiTheme
  }
})
</script>

<style scoped>
.statistic-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.statistic-item :deep(.el-statistic__number) {
  font-size: 12px;
  font-weight: 600;
  color: rgb(31, 41, 55);
  line-height: 1.2;
}

.statistic-item-desktop {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.statistic-item-desktop :deep(.el-statistic__number) {
  font-size: 14px;
  font-weight: 600;
  color: rgb(31, 41, 55);
  line-height: 1.2;
}

/* 统计标签样式优化 */
.stat-tag {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  font-weight: 600 !important;
  padding: 6px 12px !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.2s ease !important;
}

.stat-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.stat-tag :deep(.el-tag__content) {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: rgb(31, 41, 55);
  font-weight: 600;
}

/* 移动端统计标签样式 */
.stat-tag-mobile {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  font-weight: 600 !important;
  padding: 4px 8px !important;
  border-radius: 10px !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
  font-size: 11px !important;
}

.stat-tag-mobile :deep(.el-tag__content) {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: rgb(31, 41, 55);
  font-weight: 600;
}
</style>

