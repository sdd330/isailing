import type { GameState } from '@/types/game'
import type { GameConfig } from '@/config/game.config'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface SolarTerm {
  name: string
  icon: string
  description: string
  season: Season
}

// 24节气列表（按一年顺序），这里不强行对应真实日期，只做一年内的节奏与氛围
export const SOLAR_TERMS: SolarTerm[] = [
  { name: '立春', icon: '🌱', description: '万物复苏，乍暖还寒', season: 'spring' },
  { name: '雨水', icon: '🌧️', description: '春雨渐多，注意防潮保暖', season: 'spring' },
  { name: '惊蛰', icon: '⛈️', description: '雷声初响，气温起伏大', season: 'spring' },
  { name: '春分', icon: '🌸', description: '昼夜平分，踏青好时节', season: 'spring' },
  { name: '清明', icon: '🍃', description: '天气转暖，易受凉感冒', season: 'spring' },
  { name: '谷雨', icon: '🌦️', description: '春季最后一个节气，潮湿闷热', season: 'spring' },
  { name: '立夏', icon: '☀️', description: '气温快速升高，注意防暑', season: 'summer' },
  { name: '小满', icon: '🌾', description: '空气湿热，容易乏力', season: 'summer' },
  { name: '芒种', icon: '🌤️', description: '雨水增多，闷热潮湿', season: 'summer' },
  { name: '夏至', icon: '🔥', description: '一年中日照最长，高温来袭', season: 'summer' },
  { name: '小暑', icon: '🥵', description: '持续高温，谨防中暑', season: 'summer' },
  { name: '大暑', icon: '🌡️', description: '酷热难耐，注意补水与防晒', season: 'summer' },
  { name: '立秋', icon: '🍂', description: '暑气未尽，早晚略凉', season: 'autumn' },
  { name: '处暑', icon: '🌥️', description: '暑热渐退，昼夜温差加大', season: 'autumn' },
  { name: '白露', icon: '💧', description: '清晨有露，注意添衣', season: 'autumn' },
  { name: '秋分', icon: '🌾', description: '昼夜平分，秋高气爽', season: 'autumn' },
  { name: '寒露', icon: '🍁', description: '天气转凉，易着凉感冒', season: 'autumn' },
  { name: '霜降', icon: '❄️', description: '初霜将至，寒意渐浓', season: 'autumn' },
  { name: '立冬', icon: '☃️', description: '天气转冷，注意保暖', season: 'winter' },
  { name: '小雪', icon: '🌨️', description: '飘雪将临，气温骤降', season: 'winter' },
  { name: '大雪', icon: '❄️', description: '风雪交加，寒冷刺骨', season: 'winter' },
  { name: '冬至', icon: '🕯️', description: '昼最短夜最长，阳气初生', season: 'winter' },
  { name: '小寒', icon: '🥶', description: '一年中最冷的时段之一', season: 'winter' },
  { name: '大寒', icon: '🧊', description: '严寒刺骨，注意防寒保暖', season: 'winter' }
]

export function getCurrentWeek(state: GameState, config: GameConfig): number {
  const totalWeeks = config.time.totalWeeks || 52
  // 第1周从1开始计数
  const week = totalWeeks + 1 - state.timeLeft
  return Math.min(Math.max(week, 1), totalWeeks)
}

export function getSolarTermByWeek(week: number, totalWeeks: number): SolarTerm {
  const termCount = SOLAR_TERMS.length
  const weeksPerTerm = totalWeeks / termCount
  let index = Math.floor((week - 1) / weeksPerTerm)
  if (index < 0) index = 0
  if (index >= termCount) index = termCount - 1
  // 确保索引在有效范围内
  const safeIndex = Math.max(0, Math.min(index, termCount - 1))
  const term = SOLAR_TERMS[safeIndex]
  // 使用非空断言，因为我们已经确保了索引在有效范围内
  return term!
}

export function getSolarTermForState(state: GameState, config: GameConfig): SolarTerm {
  const week = getCurrentWeek(state, config)
  return getSolarTermByWeek(week, config.time.totalWeeks || 52)
}

export function isTransitionSeason(season: Season): boolean {
  return season === 'spring' || season === 'autumn'
}


