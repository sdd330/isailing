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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { GameState } from '@/types/game'
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
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const tipDialogVisible = ref(true)
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
  showHealthPointsDialog: () => { healthPointsDialogVisible.value = true }
})
</script>

