import type { GameState } from '@/types/game'

/**
 * 玩家领域模型
 * 封装玩家状态和操作
 */
export class Player {
  constructor(private state: GameState) {}

  get cash(): number {
    return this.state.cash
  }

  get debt(): number {
    return this.state.debt
  }

  get bankSavings(): number {
    return this.state.bankSavings
  }

  get health(): number {
    return this.state.health
  }

  get stamina(): number {
    return this.state.stamina
  }

  get fame(): number {
    return this.state.fame
  }

  get timeLeft(): number {
    return this.state.timeLeft
  }

  get totalGoods(): number {
    return this.state.totalGoods
  }

  get maxCapacity(): number {
    return this.getEffectiveMaxCapacity()
  }

  get currentCity(): string {
    return this.state.currentCity
  }

  get currentLocation(): number {
    return this.state.currentLocation
  }

  addCash(amount: number): void {
    this.state.cash += amount
  }

  subtractCash(amount: number): void {
    this.state.cash = Math.max(0, this.state.cash - amount)
  }

  addDebt(amount: number): void {
    this.state.debt += amount
  }

  subtractDebt(amount: number): void {
    this.state.debt = Math.max(0, this.state.debt - amount)
  }

  addBankSavings(amount: number): void {
    this.state.bankSavings += amount
  }

  subtractBankSavings(amount: number): void {
    this.state.bankSavings = Math.max(0, this.state.bankSavings - amount)
  }

  addHealth(points: number): void {
    this.state.health = Math.min(100, this.state.health + points)
  }

  subtractHealth(points: number): void {
    this.state.health = Math.max(0, this.state.health - points)
  }

  addStamina(points: number): void {
    const max = this.state.maxStamina || 100
    this.state.stamina = Math.min(max, this.state.stamina + points)
  }

  subtractStamina(points: number): void {
    this.state.stamina = Math.max(0, this.state.stamina - points)
  }

  addFame(points: number): void {
    this.state.fame = Math.max(0, this.state.fame + points)
  }

  subtractFame(points: number): void {
    this.state.fame = Math.max(0, this.state.fame - points)
  }

  decreaseTime(): void {
    this.state.timeLeft = Math.max(0, this.state.timeLeft - 1)
  }

  increaseCapacity(amount: number): void {
    // 基础容量（行李箱）保持不变，额外容量全局累积
    const base = this.state.baseCapacity ?? this.state.maxCapacity
    this.state.maxCapacity = (this.state.maxCapacity || base) + amount
  }

  /**
   * 当前生效的最大容量：
   * - 在当前城市已经通过中介租房 → 使用全局 maxCapacity
   * - 否则 → 只能使用行李箱基础容量（baseCapacity）
   */
  getEffectiveMaxCapacity(): number {
    const base = this.state.baseCapacity ?? this.state.maxCapacity
    const hasRented = this.state.rentedCities?.includes(this.state.currentCity) || false
    return hasRented ? (this.state.maxCapacity || base) : base
  }

  setCurrentCity(cityName: string): void {
    this.state.currentCity = cityName
  }

  setCurrentLocation(locationId: number): void {
    this.state.currentLocation = locationId
  }

  canAfford(amount: number): boolean {
    return this.state.cash >= amount
  }

  hasSpace(amount: number): boolean {
    const max = this.getEffectiveMaxCapacity()
    return (max - this.state.totalGoods) >= amount
  }

  getAvailableSpace(): number {
    const max = this.getEffectiveMaxCapacity()
    return Math.max(0, max - this.state.totalGoods)
  }

  getTotalAssets(): number {
    return this.state.cash + this.state.bankSavings
  }

  getNetWorth(): number {
    return this.getTotalAssets() - this.state.debt
  }
}
