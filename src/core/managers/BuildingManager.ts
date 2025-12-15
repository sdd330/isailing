import type { GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'
import type { IMessageHandler } from '../interfaces/IMessageHandler'
import { BaseManager } from '../base/BaseManager'
import { Building, BuildingType } from '../models/Building'
import { Player } from '../models/Player'
import { City } from '../models/City'
import { LocationService } from '../services/LocationService'
import { PlaceService } from '../services/PlaceService'
import { Random } from '../utils/Random'
import { availableCities, shanghaiTheme } from '@/config/theme.config'

export class BuildingManager extends BaseManager {
  private buildings: Map<BuildingType, Building> = new Map()
  private player: Player
  private city: City | null = null

  constructor(
    state: GameState,
    config: GameConfig,
    messageHandler: IMessageHandler
  ) {
    super(state, config, messageHandler)
    this.player = new Player(state)
    this.updateCity()
    this.initializeBuildings()
  }

  private updateCity(): void {
    const cityInfo = availableCities.find(c => c.name === this.state.currentCity)
    if (cityInfo) {
      this.city = new City(
        cityInfo.name,
        cityInfo.shortName,
        cityInfo.theme,
        [...this.state.cityVisitsThisWeek]
      )
    }
  }

  private initializeBuildings(): void {
    const cityInfo = availableCities.find(c => c.name === this.state.currentCity)
    const theme = cityInfo?.theme || availableCities[0]?.theme || shanghaiTheme

    this.buildings.set(BuildingType.BANK, new Building(
      BuildingType.BANK,
      theme.buildings.bank.name,
      theme.buildings.bank.icon,
      '存款取款服务',
      this.config
    ))

    this.buildings.set(BuildingType.HOSPITAL, new Building(
      BuildingType.HOSPITAL,
      theme.buildings.hospital.name,
      theme.buildings.hospital.icon,
      '治疗健康',
      this.config
    ))

    this.buildings.set(BuildingType.DELIVERY, new Building(
      BuildingType.DELIVERY,
      theme.buildings.delivery.name,
      theme.buildings.delivery.icon,
      theme.buildings.delivery.description,
      this.config
    ))

    this.buildings.set(BuildingType.CONSTRUCTION_SITE, new Building(
      BuildingType.CONSTRUCTION_SITE,
      theme.buildings.constructionSite.name,
      theme.buildings.constructionSite.icon,
      theme.buildings.constructionSite.description,
      this.config
    ))

    this.buildings.set(BuildingType.POST_OFFICE, new Building(
      BuildingType.POST_OFFICE,
      theme.buildings.postOffice.name,
      theme.buildings.postOffice.icon,
      theme.buildings.postOffice.description,
      this.config
    ))

    this.buildings.set(BuildingType.HOUSE, new Building(
      BuildingType.HOUSE,
      theme.buildings.house.name,
      theme.buildings.house.icon,
      theme.buildings.house.description,
      this.config
    ))

    this.buildings.set(BuildingType.AIRPORT, new Building(
      BuildingType.AIRPORT,
      theme.buildings.airport.name,
      theme.buildings.airport.icon,
      theme.buildings.airport.description,
      this.config
    ))

    this.buildings.set(BuildingType.TRAIN_STATION, new Building(
      BuildingType.TRAIN_STATION,
      theme.buildings.trainStation.name,
      theme.buildings.trainStation.icon,
      theme.buildings.trainStation.description,
      this.config
    ))
  }

  getBuilding(type: BuildingType): Building | undefined {
    return this.buildings.get(type)
  }

  getAllBuildings(): Building[] {
    return Array.from(this.buildings.values())
  }

  updateBuildingsForCity(cityName: string): void {
    const cityInfo = availableCities.find(c => c.name === cityName)
    if (cityInfo) {
      this.city = new City(
        cityInfo.name,
        cityInfo.shortName,
        cityInfo.theme,
        [...this.state.cityVisitsThisWeek]
      )
      this.initializeBuildings()
    }
  }

  setCity(city: City): void {
    this.city = city
    this.initializeBuildings()
  }

  getCurrentCity(): City | null {
    return this.city
  }

  hospitalTreatment(points: number): boolean {
    const hospital = this.getBuilding(BuildingType.HOSPITAL)
    if (!hospital) {
      return false
    }

    if (this.player.health >= 100) {
      this.showMessage("小护士笑着说：\"你看起来气色很好，不需要治疗。\"")
      return false
    }

    const cost = points * (hospital.getInfo().costPerPoint || 0)
    if (!this.player.canAfford(cost)) {
      this.showMessage("医生说：\"钱不够！拒绝治疗！\"")
      return false
    }

    const oldHealth = this.player.health
    this.player.subtractCash(cost)
    this.player.addHealth(points)
    
    this.showMessage(`治疗成功！健康从${oldHealth}点恢复到${this.player.health}点，花费${cost.toLocaleString()}元`)
    return true
  }

  visitDelivery(): boolean {
    const delivery = this.getBuilding(BuildingType.DELIVERY)
    if (!delivery) {
      return false
    }

    const cost = delivery.getCost()
    if (cost === null || !this.player.canAfford(cost)) {
      this.showMessage("现金不足，无法送外卖！")
      return false
    }

    // 检查健康值是否过低
    if (this.player.health <= 0) {
      this.showMessage("健康值过低，无法送外卖！请先去医院治疗。")
      return false
    }

    this.player.subtractCash(cost)
    this.player.incrementDeliveryVisits()

    // 送外卖有健康风险，从配置中获取健康风险范围
    const healthRisk = this.config.buildings.delivery.healthRisk
    const healthLoss = Random.range(healthRisk[0], healthRisk[1])
    const oldHealth = this.player.health
    this.player.subtractHealth(healthLoss)
    
    const bonusRange = delivery.getInfo().bonusRange
    if (bonusRange) {
      const bonus = Random.range(bonusRange[0], bonusRange[1])
      this.player.addCash(bonus)
      
      // 根据健康值变化生成不同的消息
      if (healthLoss === 1) {
        this.showMessage(`送外卖成功，获得${bonus}元收入！稍微消耗了体力，健康值从${oldHealth}点降至${this.player.health}点（-${healthLoss}点）`)
      } else if (healthLoss === 2) {
        this.showMessage(`送外卖成功，获得${bonus}元收入！消耗了体力，健康值从${oldHealth}点降至${this.player.health}点（-${healthLoss}点）`)
      } else {
        this.showMessage(`送外卖成功，获得${bonus}元收入！但消耗了大量体力，健康值从${oldHealth}点降至${this.player.health}点（-${healthLoss}点）`)
      }
    }
    return true
  }

  visitConstructionSite(): boolean {
    const constructionSite = this.getBuilding(BuildingType.CONSTRUCTION_SITE)
    if (!constructionSite) {
      return false
    }

    // 检查健康值是否过低
    if (this.player.health <= 0) {
      this.showMessage("健康值过低，无法去工地打工！请先去医院治疗。")
      return false
    }

    const oldHealth = this.player.health

    // 计算收入
    const incomeRange = this.config.buildings.constructionSite.incomeRange
    const income = Random.range(incomeRange[0], incomeRange[1])
    this.player.addCash(income)

    // 正常健康减少
    const healthLossRange = this.config.buildings.constructionSite.healthLoss
    const normalHealthLoss = Random.range(healthLossRange[0], healthLossRange[1])
    this.player.subtractHealth(normalHealthLoss)

    // 检查是否有受伤风险
    const injuryRisk = this.config.buildings.constructionSite.injuryRisk
    const roll = Random.num(100)
    let injuryDamage = 0
    let isInjured = false

    if (roll < injuryRisk) {
      // 发生受伤事件
      isInjured = true
      const injuryDamageRange = this.config.buildings.constructionSite.injuryDamage
      injuryDamage = Random.range(injuryDamageRange[0], injuryDamageRange[1])
      this.player.subtractHealth(injuryDamage)
    }

    // 生成消息
    if (isInjured) {
      this.showMessage(`⚠️ 工地打工发生意外！获得${income}元收入，但严重受伤！健康值从${oldHealth}点降至${this.player.health}点（正常-${normalHealthLoss}点，受伤-${injuryDamage}点）`)
    } else {
      this.showMessage(`🏗️ 工地打工完成，获得${income}元收入！消耗了体力，健康值从${oldHealth}点降至${this.player.health}点（-${normalHealthLoss}点）`)
    }

    return true
  }

  expandHouse(): boolean {
    const house = this.getBuilding(BuildingType.HOUSE)
    if (!house) {
      return false
    }

    const houseInfo = house.getInfo()
    let cost = houseInfo.expansionCost || 0
    
    if (houseInfo.discountThreshold && this.player.canAfford(houseInfo.discountThreshold)) {
      cost = Math.floor(cost / 2)
    }

    if (!this.player.canAfford(cost)) {
      this.showMessage("现金不足，无法扩建房屋！")
      return false
    }

    this.player.subtractCash(cost)
    const capacityIncrease = houseInfo.capacityIncrease || 0
    this.player.increaseCapacity(capacityIncrease)
    this.showMessage(`房屋扩建成功，仓库容量增加${capacityIncrease}！`)
    return true
  }

  checkForcedHospitalization(): boolean {
    const hospital = this.getBuilding(BuildingType.HOSPITAL)
    if (!hospital) {
      return false
    }

    const triggerHealth = hospital.getInfo().triggerHealth || 85
    
    if (this.player.health < triggerHealth && this.player.timeLeft > 3) {
      const delayDays = 1 + Math.floor(Math.random() * 2)
      const hospitalCost = delayDays * (1000 + Math.floor(Math.random() * 8500))
      
      this.player.addDebt(hospitalCost)
      
      const healthRestored = 10
      this.player.addHealth(healthRestored)
      
      for (let i = 0; i < delayDays; i++) {
        this.player.decreaseTime()
      }
      
      const location = this.getRandomLocation()
      const place = PlaceService.getRandomPlaceForCity(this.player.currentCity)
      this.showMessage(`你的健康状况太差，被抬进医院治疗了${delayDays}天。\n你在不注意时，被人发现在${location}的${place}。\n村长好心为你垫付了住院费${hospitalCost.toLocaleString()}元。\n健康恢复了${healthRestored}点。`)
      
      return true
    }
    
    if (this.player.health < 20 && this.player.health > 0) {
      this.showMessage("你的健康...非常危险...去医院..")
      return false
    }
    
    return false
  }

  private getRandomLocation(): string {
    if (!this.city) {
      this.updateCity()
    }
    
    if (this.city) {
      return LocationService.getRandomLocationName(this.city)
    }
    
    return '某地'
  }
}

