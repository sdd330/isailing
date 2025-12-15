/**
 * PWA 图标生成脚本
 * 使用 Canvas API 生成所需的图标文件
 * 
 * 使用方法：
 * node scripts/generate-icons.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCanvas } from 'canvas'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 确保 public 目录存在
const publicDir = path.join(__dirname, '../public')
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// 创建渐变背景
function createGradient(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#667eea')
  gradient.addColorStop(1, '#764ba2')
  return gradient
}

// 生成图标
function generateIcon(size, filename) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  // 绘制渐变背景
  ctx.fillStyle = createGradient(ctx, size, size)
  ctx.fillRect(0, 0, size, size)
  
  // 绘制文字
  ctx.fillStyle = 'white'
  ctx.font = `bold ${size * 0.3}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('沪', size / 2, size / 2)
  
  // 保存文件
  const buffer = canvas.toBuffer('image/png')
  const filepath = path.join(publicDir, filename)
  fs.writeFileSync(filepath, buffer)
  console.log(`✅ 已生成: ${filename} (${size}x${size})`)
}

// 生成所有图标
console.log('开始生成 PWA 图标...\n')

try {
  generateIcon(192, 'pwa-192x192.png')
  generateIcon(512, 'pwa-512x512.png')
  generateIcon(180, 'apple-touch-icon.png')
  
  console.log('\n✅ 所有图标生成完成！')
} catch (error) {
  console.error('❌ 生成图标失败:', error.message)
  console.log('\n提示: 需要安装 canvas 包: npm install canvas')
  process.exit(1)
}
