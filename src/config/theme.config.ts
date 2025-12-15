import { ConfigManager } from './ConfigManager'
import { BeijingCityConfig } from './cities/beijing'
import { ShanghaiCityConfig } from './cities/shanghai'
import { HangzhouCityConfig } from './cities/hangzhou'
import { SuzhouCityConfig } from './cities/suzhou'
import { ShenzhenCityConfig } from './cities/shenzhen'
import { TianjinCityConfig } from './cities/tianjin'
import { QingdaoCityConfig } from './cities/qingdao'
import { GuangzhouCityConfig } from './cities/guangzhou'

// 配置管理器 - 单例模式
export const configManager = ConfigManager.getInstance()

// 注册所有8个城市的配置
configManager.registerCity('beijing', new BeijingCityConfig())
configManager.registerCity('shanghai', new ShanghaiCityConfig())
configManager.registerCity('hangzhou', new HangzhouCityConfig())
configManager.registerCity('suzhou', new SuzhouCityConfig())
configManager.registerCity('shenzhen', new ShenzhenCityConfig())
configManager.registerCity('tianjin', new TianjinCityConfig())
configManager.registerCity('qingdao', new QingdaoCityConfig())
configManager.registerCity('guangzhou', new GuangzhouCityConfig())

// 设置默认城市
configManager.setCurrentCity('beijing')

// 导出便捷函数
export const getCurrentCity = () => configManager.getCurrentCityConfig()
export const getCity = (key: string) => configManager.getCityConfig(key)
/**
 * 根据城市中文名或简称获取配置键（如 '上海' -> 'shanghai'）
 * 如果找不到匹配，则回退为 name.toLowerCase()
 */
export const getCityKeyByName = (nameOrShortName: string): string => {
  const cities = configManager.getCityList()
  const found = cities.find(
    c => c.name === nameOrShortName || c.shortName === nameOrShortName
  )
  return found?.key ?? nameOrShortName.toLowerCase()
}
export const getGameConfig = () => configManager.getGameConfig()
export const setCurrentCity = (key: string) => configManager.setCurrentCity(key)
export const getAvailableCities = () => configManager.getCityList()

// 导出配置类和接口
export { CityConfig } from './ConfigManager'
export type { GameConfig, PriceStrategy, EventStrategy, TransportationStrategy, RentStrategy, BuildingConfig } from './game.config'
