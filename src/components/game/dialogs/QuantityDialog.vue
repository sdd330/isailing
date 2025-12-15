<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="isMobile ? '90%' : '480px'"
    align-center
    destroy-on-close
    class="dialog-compact"
  >
    <el-form label-width="100px" label-position="left">
      <el-form-item label="商品名称">
        <span class="text-base font-medium">{{ goodsName }}</span>
      </el-form-item>
      <el-form-item label="单价">
        <span class="text-base text-primary">{{ unitPrice.toLocaleString() }}元</span>
      </el-form-item>
      <el-form-item v-if="type === 'buy'" label="当前现金">
        <span class="text-base text-success">{{ gameState.cash.toLocaleString() }}元</span>
      </el-form-item>
      <el-form-item v-if="type === 'buy'" label="仓库容量">
        <span class="text-base">{{ gameState.totalGoods }}/{{ gameState.maxCapacity }}</span>
      </el-form-item>
      <el-form-item v-else label="持有数量">
        <span class="text-base font-medium">{{ ownedQuantity }}件</span>
      </el-form-item>
      <el-form-item label="购买数量">
        <el-input-number
          v-model="quantity"
          :min="1"
          :max="maxQuantity"
          :step="1"
          :precision="0"
          placeholder="输入数量"
          class="w-full"
          :controls="true"
        />
      </el-form-item>
      <el-form-item label="快捷选择">
        <div class="flex flex-wrap gap-2">
          <el-check-tag
            class="quick-tag"
            :checked="quantity === Math.max(1, Math.floor(maxQuantity * 0.5))"
            @change="() => quantity = Math.max(1, Math.floor(maxQuantity * 0.5))"
          >
            50%
          </el-check-tag>
          <el-check-tag
            class="quick-tag"
            :checked="quantity === maxQuantity"
            @change="() => quantity = maxQuantity"
          >
            全部
          </el-check-tag>
        </div>
      </el-form-item>
      <el-form-item v-if="type === 'buy'" label="总价">
        <span class="text-lg font-bold text-danger">{{ totalPrice.toLocaleString() }}元</span>
      </el-form-item>
      <el-form-item v-else label="总收益">
        <span class="text-lg font-bold text-success">{{ totalPrice.toLocaleString() }}元</span>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          :disabled="!quantity || quantity <= 0 || quantity > maxQuantity"
        >
          {{ type === 'buy' ? '确认购买' : '确认出售' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { GameState } from '@/types/game'
import { useMobile } from '@/composables/useMobile'

interface Props {
  modelValue: boolean
  type: 'buy' | 'sell'
  gameState: GameState
  goodsName: string
  unitPrice: number
  ownedQuantity?: number
  maxQuantity: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [quantity: number]
}>()

const { isMobile } = useMobile()
const quantity = ref(1)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => {
  return props.type === 'buy' ? '🛒 购买商品' : '💰 出售商品'
})

const totalPrice = computed(() => {
  return props.unitPrice * quantity.value
})

watch(() => props.modelValue, (visible) => {
  if (visible) {
    // 默认选择1件或最大数量的25%
    quantity.value = Math.max(1, Math.floor(props.maxQuantity * 0.25))
  }
})

watch(() => props.maxQuantity, (newMax) => {
  if (quantity.value > newMax) {
    quantity.value = newMax
  }
})

const handleConfirm = () => {
  if (quantity.value > 0 && quantity.value <= props.maxQuantity) {
    emit('confirm', quantity.value)
  }
}
</script>
