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
    return this.state.maxCapacity
  }

  get currentCity(): string {
    return this.state.currentCity
  }

  get currentLocation(): number {
    return this.state.currentLocation
  }

  get deliveryVisits(): number {
    return this.state.deliveryVisits
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
    this.state.maxCapacity += amount
  }

  setCurrentCity(cityName: string): void {
    this.state.currentCity = cityName
  }

  setCurrentLocation(locationId: number): void {
    this.state.currentLocation = locationId
  }

  incrementDeliveryVisits(): void {
    this.state.deliveryVisits++
  }

  canAfford(amount: number): boolean {
    return this.state.cash >= amount
  }

  hasSpace(amount: number): boolean {
    return (this.state.maxCapacity - this.state.totalGoods) >= amount
  }

  getAvailableSpace(): number {
    return Math.max(0, this.state.maxCapacity - this.state.totalGoods)
  }

  getTotalAssets(): number {
    return this.state.cash + this.state.bankSavings
  }

  getNetWorth(): number {
    return this.getTotalAssets() - this.state.debt
  }
}
