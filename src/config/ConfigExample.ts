import { configManager, getCurrentCity, getCity, setCurrentCity, getAvailableCities } from './theme.config'
import type { Season } from './constants'

/**
 * 配置系统使用示例
 */
export class ConfigExample {

  /**
   * 获取当前城市的所有商品价格
   */
  static getCurrentCityGoodsPrices(week: number = 1) {
    const city = getCurrentCity()
    if (!city) return []

    const goods = city.getGoods()
    return goods.map(good => ({
      name: good.name,
      basePrice: good.basePrice,
      currentPrice: configManager.calculateGoodsPrice(good.id, week)
    }))
  }

  /**
   * 展示城市特色信息
   */
  static showCityFeatures(cityKey: string = 'beijing') {
    const city = getCity(cityKey)
    if (!city) {
      console.log(`找不到城市: ${cityKey}`)
      return
    }

    console.log(`🏙️ ${city.getCityName()} (${city.getShortName()})`)
    console.log(`📝 城市描述: ${city.getDescription()}`)
    console.log(`✨ 城市特色:`)
    city.getFeatures().forEach((feature, index) => {
      console.log(`  ${index + 1}. ${feature}`)
    })
  }

  /**
   * 展示所有城市的特色信息
   */
  static showAllCitiesFeatures() {
    const cities = getAvailableCities()
    console.log('🌍 所有8个城市的特色信息:\n')

    cities.forEach(cityInfo => {
      const city = getCity(cityInfo.key)
      if (city) {
        console.log(`🏙️ ${city.getCityName()} (${city.getShortName()})`)
        console.log(`📝 ${city.getDescription()}`)
        console.log(`✨ 特色:`)
        city.getFeatures().forEach(feature => {
          console.log(`  • ${feature}`)
        })
        console.log('')
      }
    })
  }

  /**
   * 获取城市间交通费用
   */
  static getTransportationCost(fromCity: string, toCity: string, type: 'train' | 'plane') {
    return configManager.getTransportationCost(fromCity, toCity, type)
  }

  /**
   * 获取城市特色随机事件
   */
  static getCityEvents(cityKey: string, type: 'commercial' | 'health' | 'money', season?: Season) {
    return configManager.getRandomEvents(cityKey, type, season)
  }

  /**
   * 切换城市并返回新城市配置
   */
  static switchCity(cityKey: string) {
    const success = setCurrentCity(cityKey)
    return success ? getCity(cityKey) : null
  }

  /**
   * 获取所有城市列表
   */
  static getAllCities() {
    return getAvailableCities()
  }

  /**
   * 演示城市健康事件差异
   */
  static showCityHealthDifferences() {
    console.log('=== 城市健康事件特色对比 ===')

    const cities = ['beijing', 'tianjin', 'guangzhou']

    cities.forEach(cityKey => {
      const healthEvents = this.getCityEvents(cityKey, 'health')
      const city = getCity(cityKey)
      console.log(`\n${city?.getCityName()}(${cityKey}):`)
      healthEvents.slice(0, 2).forEach(event => {
        const damage = 'damage' in event ? event.damage : '无'
        console.log(`  - ${event.message} (${damage}伤害)`)
      })
    })
  }
}
