import { ref } from 'vue'

export function useGameDialogs() {
  const tipDialogVisible = ref(true)
  const gameOverDialogVisible = ref(false)
  const bankDepositDialogVisible = ref(false)
  const bankWithdrawDialogVisible = ref(false)
  const postOfficeDialogVisible = ref(false)
  const bankAmount = ref(0)
  const postAmount = ref(0)

  const showBankDeposit = () => {
    bankDepositDialogVisible.value = true
  }

  const showBankWithdraw = () => {
    bankWithdrawDialogVisible.value = true
  }

  const showPostOffice = () => {
    postOfficeDialogVisible.value = true
  }

  const showGameOver = () => {
    gameOverDialogVisible.value = true
  }

  return {
    tipDialogVisible,
    gameOverDialogVisible,
    bankDepositDialogVisible,
    bankWithdrawDialogVisible,
    postOfficeDialogVisible,
    bankAmount,
    postAmount,
    showBankDeposit,
    showBankWithdraw,
    showPostOffice,
    showGameOver
  }
}

