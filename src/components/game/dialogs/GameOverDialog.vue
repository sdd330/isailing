<template>
  <el-dialog
    v-model="dialogVisible"
    :title="getGameOverTitle()"
    :width="isMobile ? '95%' : '700px'"
    center
    :close-on-click-modal="false"
    :show-close="false"
    class="game-over-dialog"
  >
    <!-- 游戏结束背景 -->
    <div class="game-over-bg">
      <div class="stars">
        <div class="star" v-for="i in 50" :key="i" :style="getStarStyle(i)"></div>
      </div>
    </div>

    <div class="game-over-content">
      <!-- 主要得分展示 -->
      <div class="score-section">
        <div class="score-glow">
          <div class="score-main">
            <div class="score-icon">🏆</div>
            <div class="score-info">
              <h2 class="score-title">最终得分</h2>
              <div class="score-value" :class="getScoreColorClass()">
                {{ formatScore(gameState.gameResult?.finalScore || 0) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 游戏统计 -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-label">游戏时长</div>
            <div class="stat-value">{{ gameState.gameResult?.timePlayed || 0 }}周</div>
            <div class="stat-progress">
              <el-progress
                type="line"
                :percentage="getProgressPercentage()"
                :stroke-width="6"
                :show-text="false"
                color="#6366f1"
              />
            </div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-label">游戏评价</div>
            <div class="stat-value evaluation-text" :class="getEvaluationColorClass()">
              {{ getFriendlyEvaluation() }}
            </div>
          </div>
        </div>
      </div>

      <!-- 成就系统 -->
      <div class="achievements-section" v-if="hasAchievements()">
        <h3 class="achievements-title">🎖️ 获得成就</h3>
        <div class="achievements-list">
          <div class="achievement-item" v-if="(gameState.gameResult?.timePlayed || 0) >= gameConfig.achievements.persistenceWeeks">
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">坚持到底</div>
            <div class="achievement-desc">完成了全部游戏时长</div>
          </div>
          <div class="achievement-item" v-if="(gameState.gameResult?.finalScore || 0) > gameConfig.achievements.wealthThreshold">
            <div class="achievement-icon">💰</div>
            <div class="achievement-text">财富自由</div>
            <div class="achievement-desc">积累了可观的财富</div>
          </div>
          <div class="achievement-item" v-if="(gameState.gameResult?.finalScore || 0) > gameConfig.achievements.eliteThreshold">
            <div class="achievement-icon">🎖️</div>
            <div class="achievement-text">商业精英</div>
            <div class="achievement-desc">达到了商业巅峰</div>
          </div>
        </div>
      </div>

      <!-- 鼓励语 -->
      <div class="motivation-section">
        <div class="motivation-text">
          {{ getMotivationText() }}
        </div>
      </div>
    </div>

    <template #footer>
      <div class="action-buttons">
        <el-button
          type="primary"
          @click="handleRestart"
          size="large"
          class="restart-btn"
        >
          <el-icon><RefreshRight /></el-icon>
          重新开始
        </el-button>
        <router-link to="/">
          <el-button
            size="large"
            class="home-btn"
          >
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
        </router-link>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RefreshRight, HomeFilled } from '@element-plus/icons-vue'
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

// 生成随机星星样式
const getStarStyle = (index: number) => {
  const delay = Math.random() * 3
  const duration = 2 + Math.random() * 2
  const size = 2 + Math.random() * 3
  const left = Math.random() * 100
  const top = Math.random() * 100

  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

// 获取游戏结束标题
const getGameOverTitle = () => {
  const score = gameState.gameResult?.finalScore || 0
  if (score > 100000) return '🎉 恭喜！商业帝国崛起！'
  if (score > 50000) return '🏆 优秀！商业精英达成！'
  if (score > 10000) return '💪 不错！创业小有所成！'
  if (score > 0) return '📈 加油！创业路漫漫！'
  return '💭 游戏结束'
}

// 格式化得分显示
const formatScore = (score: number) => {
  if (score >= 0) {
    return `${score.toLocaleString()} 元`
  } else {
    return `-${Math.abs(score).toLocaleString()} 元`
  }
}

// 获取得分颜色样式
const getScoreColorClass = () => {
  const score = gameState.gameResult?.finalScore || 0
  if (score > 100000) return 'score-excellent'
  if (score > 50000) return 'score-good'
  if (score > 10000) return 'score-normal'
  return 'score-poor'
}

// 获取进度百分比
const getProgressPercentage = () => {
  const played = gameState.gameResult?.timePlayed || 0
  const total = gameConfig.time.totalWeeks
  return Math.min((played / total) * 100, 100)
}

// 获取友好的评价文本
const getFriendlyEvaluation = () => {
  const evaluation = gameState.gameResult?.evaluation || ''
  if (evaluation.includes('大款')) return '商业大亨'
  if (evaluation.includes('还可以')) return '创业有成'
  if (evaluation.includes('银行长途电话') || evaluation.includes('去要饭吧')) return '需要努力'
  return evaluation || '继续加油'
}

// 获取评价颜色样式
const getEvaluationColorClass = () => {
  const evaluation = gameState.gameResult?.evaluation || ''
  if (evaluation.includes('大款')) return 'evaluation-excellent'
  if (evaluation.includes('还可以')) return 'evaluation-good'
  return 'evaluation-normal'
}

// 检查是否有成就
const hasAchievements = () => {
  const timePlayed = gameState.gameResult?.timePlayed || 0
  const finalScore = gameState.gameResult?.finalScore || 0

  return timePlayed >= gameConfig.achievements.persistenceWeeks ||
         finalScore > gameConfig.achievements.wealthThreshold ||
         finalScore > gameConfig.achievements.eliteThreshold
}

// 获取鼓励语
const getMotivationText = () => {
  const score = gameState.gameResult?.finalScore || 0
  const timePlayed = gameState.gameResult?.timePlayed || 0
  const totalTime = gameConfig.time.totalWeeks

  if (score > 100000) {
    return '🎊 太棒了！你已经成为商业传奇！下次挑战更高目标吧！'
  } else if (score > 50000) {
    return '🏅 优秀表现！你的商业头脑令人钦佩！'
  } else if (score > 10000) {
    return '💼 创业有道！继续积累经验，你会走得更远！'
  } else if (timePlayed >= totalTime) {
    return '⏰ 坚持就是胜利！虽然结果不如预期，但你的毅力值得赞赏！'
  } else {
    return '🌱 创业不易，但每次尝试都是宝贵的经验。调整策略，重新出发！'
  }
}

const handleRestart = () => {
  emit('restart')
  dialogVisible.value = false
}

// 获取gameState的计算属性
const gameState = computed(() => props.gameState)
</script>

<style scoped>
.game-over-dialog {
  --dialog-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --card-bg: rgba(255, 255, 255, 0.95);
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --accent-gold: #ffd700;
  --accent-silver: #c0c0c0;
  --accent-bronze: #cd7f32;
}

.game-over-dialog :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  background: var(--dialog-bg);
}

.game-over-dialog :deep(.el-dialog__header) {
  background: transparent;
  border-bottom: none;
  padding: 24px 32px 16px;
  text-align: center;
}

.game-over-dialog :deep(.el-dialog__title) {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.game-over-dialog :deep(.el-dialog__body) {
  padding: 0;
  position: relative;
  min-height: 500px;
}

.game-over-dialog :deep(.el-dialog__footer) {
  padding: 24px 32px !important;
  border-top: none !important;
  background: rgba(255, 255, 255, 0.1) !important;
  text-align: center !important;
}

/* 背景动画 */
.game-over-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.stars {
  position: relative;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0.8;
  animation: twinkle infinite ease-in-out;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 主要内容区域 */
.game-over-content {
  position: relative;
  z-index: 1;
  padding: 32px;
  color: var(--text-primary);
}

/* 得分区域 */
.score-section {
  text-align: center;
  margin-bottom: 40px;
}

.score-glow {
  position: relative;
  display: inline-block;
}

.score-glow::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { transform: scale(0.9); opacity: 0.7; }
  to { transform: scale(1.1); opacity: 1; }
}

.score-main {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
}

.score-icon {
  font-size: 3rem;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.score-info {
  flex: 1;
  text-align: left;
}

.score-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.score-value {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.score-excellent .score-value {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-good .score-value {
  background: linear-gradient(45deg, #c0c0c0, #e8e8e8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-normal .score-value {
  background: linear-gradient(45deg, #cd7f32, #d4af37);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-poor .score-value {
  color: #e53e3e;
  background: none;
  -webkit-text-fill-color: initial;
}

/* 统计区域 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-item {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.evaluation-excellent {
  color: #38a169;
}

.evaluation-good {
  color: #d69e2e;
}

.evaluation-normal {
  color: #718096;
}

.stat-progress {
  max-width: 120px;
}

/* 成就区域 */
.achievements-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 32px;
}

.achievements-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  text-align: center;
}

.achievements-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.achievement-item {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 1px solid rgba(255, 215, 0, 0.2);
  transition: all 0.3s ease;
}

.achievement-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
}

.achievement-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.achievement-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* 鼓励语区域 */
.motivation-section {
  text-align: center;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.motivation-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.6;
}

/* 按钮区域 */
.action-buttons {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 16px;
  flex-wrap: wrap;
}

.restart-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 12px;
  padding: 12px 32px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.home-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 12px;
  padding: 12px 32px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.home-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .game-over-dialog :deep(.el-dialog__header) {
    padding: 20px 24px 12px;
  }

  .game-over-dialog :deep(.el-dialog__title) {
    font-size: 1.3rem;
  }

  .game-over-content {
    padding: 24px;
  }

  .score-main {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .score-value {
    font-size: 2rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-item {
    padding: 20px;
  }

  .achievements-list {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column !important;
    gap: 12px !important;
  }

  .restart-btn,
  .home-btn {
    width: 100% !important;
    margin-bottom: 0 !important;
  }
}
</style>

