<template>
  <el-header class="glass-effect border-b border-white/20 px-2 md:px-4 py-2 md:py-3 header-gradient w-full overflow-hidden flex-shrink-0">
    <div :class="['mx-auto', isMobile ? 'w-full px-0' : 'max-w-6xl']">
      <div v-if="isMobile" class="mobile-header-content flex flex-col gap-2">
        <div class="mobile-title-row flex items-center justify-center w-full">
          <div class="flex items-center gap-2">
            <el-avatar v-if="currentTheme.game" :size="32" :class="`bg-gradient-to-br ${currentTheme.game.logoColor} shadow-lg`">
              <span class="text-white text-sm font-bold">{{ currentTheme.game.logo }}</span>
            </el-avatar>
            <div class="flex flex-col items-center">
              <h1 class="text-sm font-bold text-gray-800 m-0 text-center">
                {{ currentTheme.game.title }} · {{ currentTheme.city.name }} · {{ currentLocationName }} · 剩余 {{ gameState.timeLeft }}{{ timeUnit }}
              </h1>
              <div class="text-[11px] text-gray-600 mt-0.5" v-if="solarTerm">
                <span>{{ solarTerm.icon }} {{ solarTerm.name }}</span>
                <span class="ml-1 text-gray-400">· {{ solarTerm.description }}</span>
              </div>
            </div>
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
          <el-tag :type="gameState.stamina >= 70 ? 'success' : gameState.stamina >= 30 ? 'warning' : 'danger'" size="small" class="stat-tag-mobile">
            <span class="mr-1">⚡</span>
            <span>{{ gameState.stamina }}/{{ gameState.maxStamina }}</span>
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
            <div class="flex flex-col items-center">
              <h1 class="text-lg font-bold text-gray-800 m-0 text-center">
                {{ currentTheme.game.title }} · {{ currentTheme.city.name }} · {{ currentLocationName }} · 剩余 {{ gameState.timeLeft }}{{ timeUnit }}
              </h1>
              <div class="text-xs text-gray-600 mt-0.5" v-if="solarTerm">
                <span>{{ solarTerm.icon }} {{ solarTerm.name }}</span>
                <span class="ml-1 text-gray-400">· {{ solarTerm.description }}</span>
              </div>
            </div>
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
          <el-tag :type="gameState.stamina >= 70 ? 'success' : gameState.stamina >= 30 ? 'warning' : 'danger'" size="small" class="stat-tag">
            <span class="mr-1">⚡</span>
            <span>{{ gameState.stamina }}/{{ gameState.maxStamina }}</span>
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
import { getCity, getCityKeyByName } from '@/config/theme.config'
import { useMobile } from '@/composables/useMobile'
import { getSolarTermByWeek, type SolarTerm } from '@/utils/season'
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

const solarTerm = computed<SolarTerm | null>(() => {
  const totalWeeks = gameConfig.time.totalWeeks || 52
  if (!props.gameState) return null
  const week = totalWeeks + 1 - props.gameState.timeLeft
  if (week < 1 || week > totalWeeks) return null
  return getSolarTermByWeek(week, totalWeeks)
})

const currentTheme = computed(() => {
  if (!props.gameState || !props.gameState.currentCity) {
    const defaultCity = getCity('shanghai')
    return defaultCity ? {
      game: {
        title: `${defaultCity.getCityName()}创业记`,
        logo: defaultCity.getShortName(),
        logoColor: 'from-blue-500 to-cyan-500',
        description: '魔都创业记'
      },
      city: {
        name: defaultCity.getCityName(),
        shortName: defaultCity.getShortName(),
        locations: defaultCity.getLocations()
      }
    } : {
      game: {
        title: '上海创业记',
        logo: '沪',
        logoColor: 'from-blue-500 to-cyan-500',
        description: '魔都创业记'
      },
      city: {
        name: '上海',
        shortName: '沪',
        locations: []
      }
    }
  }

  const cityKey = getCityKeyByName(props.gameState.currentCity)
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
  if (shanghaiCity) {
    return {
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
    }
  }
  // 最后的默认值
  return {
    game: {
      title: '上海创业记',
      logo: '沪',
      logoColor: 'from-blue-500 to-cyan-500',
      description: '魔都创业记'
    },
    city: {
      name: '上海',
      shortName: '沪',
      locations: []
    }
  }
})

const currentLocationName = computed(() => {
  if (!props.gameState) return '市中心'
  const locationId = props.gameState.currentLocation
  const city = currentTheme.value.city
  const locations = Array.isArray(city.locations) ? city.locations as Array<{ id: number; name: string }> : []
  if (!locations.length || locationId == null || locationId < 0) {
    return '市中心'
  }
  const found = locations.find(l => l.id === locationId)
  return found?.name || '市中心'
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

