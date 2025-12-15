<template>
  <div>
    <TipDialog v-model="tipDialogVisible" />
    <GameOverDialog 
      v-model="gameOverDialogVisible" 
      :game-state="gameState"
      :final-score="finalScore"
      @restart="handleRestart"
    />
    <BankDepositDialog 
      v-model="bankDepositDialogVisible"
      :game-state="gameState"
      @confirm="handleBankDeposit"
    />
    <BankWithdrawDialog 
      v-model="bankWithdrawDialogVisible"
      :game-state="gameState"
      @confirm="handleBankWithdraw"
    />
    <PostOfficeDialog 
      v-model="postOfficeDialogVisible"
      :game-state="gameState"
      @confirm="handlePostOfficePayment"
    />
    <QuantityDialog
      v-model="quantityDialogVisible"
      :type="quantityDialogType"
      :game-state="gameState"
      :goods-name="quantityDialogGoodsName"
      :unit-price="quantityDialogUnitPrice"
      :owned-quantity="quantityDialogOwnedQuantity"
      :max-quantity="quantityDialogMaxQuantity"
      @confirm="handleQuantityConfirm"
    />
    <HealthPointsDialog
      v-model="healthPointsDialogVisible"
      :game-state="gameState"
      @confirm="handleHealthPointsConfirm"
    />
    <el-dialog
      v-model="subwayDialogVisible"
      title="🚇 选择地铁目的地"
      width="420px"
    >
      <div class="subway-tag-list">
        <el-tag
          v-for="loc in subwayLocations"
          :key="loc.id"
          checkable
          @click="emit('subway-location-select', loc.id); subwayDialogVisible = false"
          class="mb-1 cursor-pointer"
        >
          <span v-if="loc.hasMarket">🏪</span>
          <span>{{ loc.name }}</span>
          <span v-if="loc.meta?.fare != null" class="ml-1 text-xs text-gray-500">
            （约 {{ loc.meta.fare.toLocaleString() }} 元）
          </span>
        </el-tag>
      </div>
    </el-dialog>
    <el-dialog
      v-model="travelDialogVisible"
      :title="travelTitle"
      width="500px"
    >
      <div class="travel-steps-container">
        <el-steps
          direction="vertical"
          :active="currentCityIndex"
          :finish-status="'success'"
          :process-status="'process'"
        >
          <el-step
            v-for="opt in travelSteps"
            :key="opt.cityName + '-' + opt.type"
            :title="opt.displayTitle"
            :description="opt.description"
            :status="opt.status"
            class="travel-step-item"
            :class="{ 'current-station': opt.isCurrent, 'clickable-station': !opt.disabled }"
            @click="!opt.disabled && (emit('travel-select', { cityName: opt.cityName, type: opt.type, cost: opt.cost }), travelDialogVisible = false)"
          >
            <template #icon>
              <div class="step-icon-wrapper" :class="{ 'disabled-icon': opt.disabled }">
                <span class="text-icon">{{ opt.iconText }}</span>
              </div>
            </template>
          </el-step>
        </el-steps>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GameState, LocationDefinition } from '@/types/game'
import TipDialog from './dialogs/TipDialog.vue'
import GameOverDialog from './dialogs/GameOverDialog.vue'
import BankDepositDialog from './dialogs/BankDepositDialog.vue'
import BankWithdrawDialog from './dialogs/BankWithdrawDialog.vue'
import PostOfficeDialog from './dialogs/PostOfficeDialog.vue'
import QuantityDialog from './dialogs/QuantityDialog.vue'
import HealthPointsDialog from './dialogs/HealthPointsDialog.vue'

interface Props {
  gameState: GameState
  finalScore: number
}

interface Emits {
  (e: 'restart'): void
  (e: 'bank-deposit', amount: number): void
  (e: 'bank-withdraw', amount: number): void
  (e: 'post-office-payment', amount: number): void
  (e: 'quantity-confirm', type: 'buy' | 'sell', goodsId: number, quantity: number): void
  (e: 'health-points-confirm', points: number): void
  (e: 'subway-location-select', locationId: number): void
  (e: 'travel-select', payload: { cityName: string; type: 'train' | 'plane'; cost: number }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tipDialogVisible = ref(false)
const gameOverDialogVisible = ref(false)
const bankDepositDialogVisible = ref(false)
const bankWithdrawDialogVisible = ref(false)
const postOfficeDialogVisible = ref(false)
const quantityDialogVisible = ref(false)
const quantityDialogType = ref<'buy' | 'sell'>('buy')
const quantityDialogGoodsName = ref('')
const quantityDialogUnitPrice = ref(0)
const quantityDialogOwnedQuantity = ref(0)
const quantityDialogMaxQuantity = ref(1)
const quantityDialogGoodsId = ref(0)
const healthPointsDialogVisible = ref(false)
const subwayDialogVisible = ref(false)
const subwayLocations = ref<LocationDefinition[]>([])
const travelDialogVisible = ref(false)
const travelOptions = ref<{ cityName: string; cost: number; type: 'train' | 'plane'; disabled: boolean }[]>([])
const travelTitle = ref('选择出城目的地')
const currentCityName = ref('')

interface TravelStep {
  cityName: string
  displayTitle: string
  description: string
  status: 'wait' | 'process' | 'finish' | 'error' | 'success'
  iconText: string
  icon: string
  isCurrent: boolean
  disabled: boolean
  type: 'train' | 'plane'
  cost: number
}

const travelSteps = computed<TravelStep[]>(() => {
  const currentCity = currentCityName.value
  const steps: TravelStep[] = []

  // 添加当前城市作为起始点
  steps.push({
    cityName: currentCity,
    displayTitle: `${currentCity} (当前位置)`,
    description: '你当前所在的城市',
    status: 'finish',
    iconText: '🏠',
    icon: '🏠',
    isCurrent: true,
    disabled: true,
    type: 'train', // 不重要，因为disabled
    cost: 0
  })

  // 添加可选择的旅行目的地
  travelOptions.value.forEach((opt) => {
    const isRented = props.gameState.rentedCities?.includes(opt.cityName)
    steps.push({
      cityName: opt.cityName,
      displayTitle: `${opt.cityName}${isRented ? ' 🏠' : ''}`,
      description: opt.disabled
        ? opt.cost > 0
          ? `费用: ${opt.cost.toLocaleString()} 元${opt.disabled ? '（余额不足或本周访问次数已满或无直达路线）' : ''}`
          : '无可用路线'
        : `费用: ${opt.cost.toLocaleString()} 元`,
      status: opt.disabled ? 'error' : 'process',
      iconText: opt.type === 'plane' ? '✈️' : '🚂',
      icon: opt.type === 'plane' ? '✈️' : '🚂',
      isCurrent: false,
      disabled: opt.disabled,
      type: opt.type,
      cost: opt.cost
    })
  })

  return steps
})

const currentCityIndex = computed(() => {
  return travelSteps.value.findIndex(step => step.isCurrent)
})


const handleRestart = () => {
  emit('restart')
}

const handleBankDeposit = (amount: number) => {
  emit('bank-deposit', amount)
  bankDepositDialogVisible.value = false
}

const handleBankWithdraw = (amount: number) => {
  emit('bank-withdraw', amount)
  bankWithdrawDialogVisible.value = false
}

const handlePostOfficePayment = (amount: number) => {
  emit('post-office-payment', amount)
  postOfficeDialogVisible.value = false
}

const handleQuantityConfirm = (quantity: number) => {
  emit('quantity-confirm', quantityDialogType.value, quantityDialogGoodsId.value, quantity)
  quantityDialogVisible.value = false
}

const handleHealthPointsConfirm = (points: number) => {
  emit('health-points-confirm', points)
  healthPointsDialogVisible.value = false
}

defineExpose({
  showBankDeposit: () => { bankDepositDialogVisible.value = true },
  showBankWithdraw: () => { bankWithdrawDialogVisible.value = true },
  showPostOffice: () => { postOfficeDialogVisible.value = true },
  showGameOver: () => { gameOverDialogVisible.value = true },
  showQuantityDialog: (
    type: 'buy' | 'sell',
    goodsId: number,
    goodsName: string,
    unitPrice: number,
    ownedQuantity: number,
    maxQuantity: number
  ) => {
    quantityDialogType.value = type
    quantityDialogGoodsId.value = goodsId
    quantityDialogGoodsName.value = goodsName
    quantityDialogUnitPrice.value = unitPrice
    quantityDialogOwnedQuantity.value = ownedQuantity
    quantityDialogMaxQuantity.value = maxQuantity
    quantityDialogVisible.value = true
  },
  showHealthPointsDialog: () => { healthPointsDialogVisible.value = true },
  showSubwayDialog: (locations: LocationDefinition[]) => {
    subwayLocations.value = locations
    subwayDialogVisible.value = true
  },
  showTravelDialog: (
    payload: {
      currentCity: string
      transportName: string
      transportIcon: string
      uniqueVisitsCount: number
      options: { cityName: string; cost: number; type: 'train' | 'plane'; disabled: boolean }[]
    }
  ) => {
    currentCityName.value = payload.currentCity
    travelTitle.value = `${payload.transportIcon} 选择要前往的城市（${payload.transportName}）`
    travelOptions.value = payload.options
    travelDialogVisible.value = true
  }
})
</script>

<style scoped>
.subway-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.travel-steps-container {
  max-height: 400px;
  overflow-y: auto;
}


.travel-step-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.travel-step-item:hover:not(.current-station) {
  transform: translateX(4px);
}

.clickable-station:hover {
  opacity: 0.8;
}

.subway-step-item {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  border: 1px solid transparent;
}

.subway-step-item:hover {
  background-color: rgba(64, 158, 255, 0.05);
  border-color: rgba(64, 158, 255, 0.2);
  transform: translateX(2px);
}

.current-station {
  background-color: rgba(64, 158, 255, 0.1);
  border-left: 4px solid #409eff;
  padding-left: 12px;
}

.step-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
}

.step-icon-wrapper.disabled-icon {
  background: linear-gradient(135deg, #a0a0a0 0%, #808080 100%);
  opacity: 0.6;
}

.text-icon {
  font-size: 20px;
  line-height: 1;
  display: inline-block;
}


.current-station .step-icon-wrapper {
  background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.4);
}

/* 自定义步骤条样式 */
:deep(.el-step__head) {
  transition: all 0.3s ease;
}

:deep(.el-step__title) {
  font-weight: 600;
  font-size: 16px;
}

:deep(.el-step__description) {
  color: #666;
  font-size: 14px;
  margin-top: 4px;
}


/* 完成状态的步骤 */
:deep(.el-step.is-finish .el-step__head) {
  color: #67c23a;
}

:deep(.el-step.is-finish .el-step__title) {
  color: #67c23a;
}

/* 错误状态的步骤 */
:deep(.el-step.is-error .el-step__head) {
  color: #f56c6c;
}

:deep(.el-step.is-error .el-step__title) {
  color: #f56c6c;
}

/* 处理中状态的步骤 */
:deep(.el-step.is-process .el-step__head) {
  color: #409eff;
}

:deep(.el-step.is-process .el-step__title) {
  color: #409eff;
}
</style>

