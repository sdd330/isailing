<template>
<el-dialog
    v-model="dialogVisible"
    title="💡 游戏提示"
    :width="isMobile ? '95%' : '500px'"
    center
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    class="tip-dialog dialog-compact"
  >
    <div class="tip-dialog-content">
      <p class="tip-main-text">每天都会有新的商品出现，合理买卖商品，处理各种随机事件，保持健康和资金链不断裂。</p>
      <div class="tip-list">
        <div class="tip-item">🏪 每天查看市场，寻找低价商品买入</div>
        <div class="tip-item">📦 在价格高时卖出商品赚取差价</div>
        <div class="tip-item">🏥 注意保持健康，健康过低会影响游戏</div>
        <div class="tip-item">💸 及时还清债务，避免利息累积</div>
        <div class="tip-item">⏰ 合理规划时间，{{ gameConfig.time.totalWeeks }}{{ gameConfig.time.unit }}（{{ gameConfig.time.unitDescription }}）内完成目标</div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false" type="primary" size="default">我知道了</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { gameConfig } from '@/config/game.config'
import { useMobile } from '@/composables/useMobile'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { isMobile } = useMobile()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style scoped>
.tip-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-main-text {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  line-height: 1.5;
}

.tip-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  font-size: 13px;
  color: #4b5563;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.08);
}

.dialog-footer {
  display: flex;
  justify-content: center;
}
</style>

