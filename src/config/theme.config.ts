import type { Goods, RandomEvent, HealthEvent, MoneyEvent, Location } from '@/types/game'
import { beijingTheme } from './cities/beijing.config'
import { shanghaiTheme } from './cities/shanghai.config'
import { guangzhouTheme } from './cities/guangzhou.config'

export interface ThemeConfig {
  game: {
    title: string
    logo: string
    logoColor: string
    description: string
  }
  city: {
    name: string
    shortName: string
    locations: Location[]
  }
  goods: Omit<Goods, 'price' | 'owned'>[]
  buildings: {
    bank: {
      name: string
      icon: string
    }
    hospital: {
      name: string
      icon: string
    }
    delivery: {
      name: string
      icon: string
      description: string
    }
    constructionSite: {
      name: string
      icon: string
      description: string
    }
    postOffice: {
      name: string
      icon: string
      description: string
    }
    house: {
      name: string
      icon: string
      description: string
    }
    airport: {
      name: string
      icon: string
      description: string
    }
    trainStation: {
      name: string
      icon: string
      description: string
    }
  }
  events: {
    commercial: RandomEvent[]
    health: HealthEvent[]
    money: MoneyEvent[]
  }
}

export { beijingTheme, shanghaiTheme, guangzhouTheme }

export const availableCities = [
  { name: '北京', shortName: '京', theme: beijingTheme },
  { name: '上海', shortName: '沪', theme: shanghaiTheme },
  { name: '广州', shortName: '穗', theme: guangzhouTheme }
]

export const currentTheme = shanghaiTheme

export function setTheme(theme: ThemeConfig) {
  return theme
}
