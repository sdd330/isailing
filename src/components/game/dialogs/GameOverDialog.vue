<template>
  <el-dialog
    v-model="dialogVisible"
    title="🎮 游戏结束"
    :width="isMobile ? '95%' : '600px'"
    center
    :close-on-click-modal="false"
    :show-close="false"
    class="game-over-dialog dialog-compact"
  >
    <div class="text-center space-y-6">
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
        <div class="relative bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
          <el-statistic
            :value="gameState.gameResult?.finalScore || 0"
            suffix="元"
            title="最终得分"
            :value-style="isMobile ? { color: 'white', fontSize: '2rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' } : { color: 'white', fontSize: '3rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }"
          />
        </div>
      </div>

      <div :class="['grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2']">
        <el-card shadow="hover" class="text-center card-shadow" body-style="padding: 20px;">
          <el-statistic
            :value="gameState.gameResult?.timePlayed || 0"
            :suffix="gameConfig.time.unit"
            :title="`游戏${gameConfig.time.unit}数`"
            :value-style="{ color: '#6366f1' }"
          />
          <el-progress
            type="circle"
            :percentage="(gameState.gameResult?.timePlayed || 0) / gameConfig.time.totalWeeks * 100"
            :width="60"
            :stroke-width="4"
            class="mt-3"
          />
        </el-card>

        <el-card shadow="hover" class="text-center card-shadow" body-style="padding: 20px;">
          <template #header>
            <div class="flex items-center justify-center gap-2">
              🏆
              <span class="font-medium">评价</span>
            </div>
          </template>
          <p class="text-lg font-bold text-green-600 mb-3">{{ gameState.gameResult?.evaluation }}</p>
          <el-tag :type="getEvaluationType(gameState.gameResult?.evaluation)" size="large">
            {{ gameState.gameResult?.evaluation }}
          </el-tag>
        </el-card>
      </div>

      <el-card shadow="hover" class="card-shadow">
        <template #header>
          <div class="flex items-center gap-2">
            <el-icon><Medal /></el-icon>
            <span class="font-medium">游戏成就</span>
          </div>
        </template>
        <div class="flex justify-center gap-4 flex-wrap">
          <el-tag type="success" v-if="(gameState.gameResult?.timePlayed || 0) >= gameConfig.achievements.persistenceWeeks">🏆 坚持到底</el-tag>
          <el-tag type="warning" v-if="(gameState.gameResult?.finalScore || 0) > gameConfig.achievements.wealthThreshold">💰 财富自由</el-tag>
          <el-tag type="info" v-if="(gameState.gameResult?.finalScore || 0) > gameConfig.achievements.eliteThreshold">🎖️ 商业精英</el-tag>
        </div>
      </el-card>
    </div>

    <template #footer>
      <div :class="['flex justify-center', isMobile ? 'flex-col gap-3' : 'gap-4']">
        <el-button
          type="primary"
          @click="handleRestart"
          :size="isMobile ? 'default' : 'large'"
          :class="['btn-hover', isMobile ? 'w-full min-h-11' : 'md:w-auto min-w-35']"
        >
          🔄 重新开始
        </el-button>
        <router-link to="/" class="w-full md:w-auto">
          <el-button
            :size="isMobile ? 'default' : 'large'"
            :class="['btn-hover', isMobile ? 'w-full min-h-11' : 'md:w-auto min-w-35']"
          >
            🏠 返回首页
          </el-button>
        </router-link>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Medal } from '@element-plus/icons-vue'
import type { GameState } from '@/types/game'
import { gameConfig } from '@/config/game.config'
import { useMobile } from '@/composables/useMobile'

interface Props {
  modelValue: boolean
  gameState: GameState
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'restart': []
}>()

const { isMobile } = useMobile()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const getEvaluationType = (evaluation?: string): string => {
  if (!evaluation) return 'info'
  if (evaluation.includes('大款')) return 'success'
  if (evaluation.includes('还可以')) return 'warning'
  return 'info'
}

const handleRestart = () => {
  emit('restart')
  dialogVisible.value = false
}
</script>

<style scoped>
.game-over-dialog :deep(.el-dialog__header),
.game-over-dialog :deep(.el-dialog__footer) {
  padding: 12px 16px;
}

.game-over-dialog :deep(.el-dialog__body) {
  padding: 16px 18px;
}
</style>

