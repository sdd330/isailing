<template>
  <div class="about min-h-screen py-4 md:py-8 relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 gradient-bg">
      <div class="absolute top-10 left-10 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-3000"></div>
    </div>

    <!-- 主要内容 -->
    <div class="relative z-10 max-w-4xl mx-auto px-3 md:px-4">
      <el-card class="glass-effect card-shadow-lg">
        <template #header>
          <div class="text-center py-6">
            <div class="relative mb-4">
              <div class="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <el-avatar size="80" class="bg-gradient-to-br from-indigo-500 to-purple-500 relative shadow-2xl">
                <span class="text-white text-3xl font-bold">京</span>
              </el-avatar>
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              关于 iSailing
            </h1>
            <p class="text-gray-600 mb-1">了解这个经典经营模拟游戏</p>
            <p class="text-gray-500 text-sm font-semibold">iSailing</p>
          </div>
        </template>

        <div class="space-y-6 md:space-y-8 p-4 md:p-6">
          <!-- 游戏概述卡片 -->
          <el-card shadow="hover" class="card-shadow">
            <template #header>
              <div class="flex items-center gap-3">
                🎮
                <span class="text-xl font-bold">游戏概述</span>
              </div>
            </template>
            <div class="space-y-4">
              <p class="text-gray-700 leading-relaxed text-lg">
                魔都i启航是一款经营模拟游戏，该游戏模拟了在大都市的商业经营生活，玩家需要通过买卖各种商品来积累财富，
                同时处理债务、健康和各种随机事件。
              </p>
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-statistic title="开发时间" value="2000-2001年" suffix="年" />
                </el-col>
                <el-col :span="6">
                  <el-statistic :title="`游戏时长`" :value="GAME_CONSTANTS.TOTAL_WEEKS" :suffix="GAME_CONSTANTS.TIME_UNIT" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="开发语言" value="C++" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="开源协议" value="GNU GPL v2.0" />
                </el-col>
              </el-row>
            </div>
          </el-card>

          <!-- 游戏特色 -->
          <el-card shadow="hover" class="card-shadow">
            <template #header>
              <div class="flex items-center gap-3">
                ✨
                <span class="text-xl font-bold">🎮 游戏特色</span>
              </div>
            </template>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-4">
                  <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div class="text-xl">🛒</div>
                    <div>
                      <div class="font-medium text-gray-900">商品交易系统</div>
                      <div class="text-sm text-gray-600">8种特色商品，动态价格波动</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div class="text-xl">🎲</div>
                    <div>
                      <div class="font-medium text-gray-900">随机事件系统</div>
                      <div class="text-sm text-gray-600">商业、健康、财务随机事件</div>
                    </div>
                  </div>
              </div>
              <div class="space-y-4">
                  <div class="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div class="text-xl">🏢</div>
                    <div>
                      <div class="font-medium text-gray-900">建筑服务系统</div>
                      <div class="text-sm text-gray-600">银行、医院、创业空间、中介</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div class="text-xl">⏰</div>
                    <div>
                      <div class="font-medium text-gray-900">时间策略</div>
                      <div class="text-sm text-gray-600">{{ GAME_CONSTANTS.TOTAL_WEEKS }}{{ GAME_CONSTANTS.TIME_UNIT }}（{{ GAME_CONSTANTS.TIME_UNIT_DESCRIPTION }}）游戏时长，决策时间有限</div>
                    </div>
                  </div>
              </div>
            </div>
          </el-card>

          <!-- 技术实现 -->
          <el-card shadow="hover" class="card-shadow">
            <template #header>
              <div class="flex items-center gap-3">
                💻
                <span class="text-xl font-bold">技术实现</span>
              </div>
            </template>
            <div class="space-y-6">
              <!-- 技术栈标签 -->
              <div>
                <h3 class="text-lg font-semibold mb-3 text-gray-800">核心技术栈</h3>
                <div class="flex flex-wrap gap-3">
                  <el-tag type="primary" size="large" class="px-4 py-1">
                    ⚡ Vue 3
                  </el-tag>
                  <el-tag type="success" size="large" class="px-4 py-1">
                    📄 TypeScript
                  </el-tag>
                  <el-tag type="info" size="large" class="px-4 py-1">
                    📊 Pinia
                  </el-tag>
                  <el-tag type="warning" size="large" class="px-4 py-1">
                    🎨 Element Plus
                  </el-tag>
                  <el-tag type="danger" size="large" class="px-4 py-1">
                    🚀 Vite
                  </el-tag>
                </div>
              </div>

              <el-divider />

              <!-- 技术亮点 -->
              <div class="grid md:grid-cols-3 gap-4">
                <el-card shadow="never" class="text-center border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <div class="text-3xl mb-2">💬</div>
                <div class="font-semibold text-gray-800">对话界面</div>
                <div class="text-sm text-gray-600">ChatGPT风格交互体验</div>
              </el-card>

              <el-card shadow="never" class="text-center border-0 bg-gradient-to-br from-green-50 to-green-100">
                <div class="text-3xl mb-2">🎨</div>
                <div class="font-semibold text-gray-800">现代化UI</div>
                <div class="text-sm text-gray-600">Element Plus组件库</div>
              </el-card>

              <el-card shadow="never" class="text-center border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <div class="text-3xl mb-2">📱</div>
                <div class="font-semibold text-gray-800">响应式设计</div>
                <div class="text-sm text-gray-600">完美适配各种设备</div>
              </el-card>
              </div>
            </div>
          </el-card>
          
        </div>

        <template #footer>
          <div class="text-center py-6">
            <router-link to="/">
              <el-button type="primary" size="large" class="btn-hover px-8">
                🏠 返回首页
              </el-button>
            </router-link>
          </div>
        </template>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GAME_CONSTANTS } from '@/utils/gameData'

defineOptions({ name: 'AboutView' })
</script>

<style scoped>
.animation-delay-3000 {
  animation-delay: 3s;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .about .el-card {
    margin-bottom: 1rem;
  }

  .about .el-card__body {
    padding: 1rem !important;
  }

  .about .el-descriptions {
    font-size: 12px;
  }

  .about .el-descriptions__label {
    font-size: 12px !important;
    padding: 8px !important;
  }

  .about .el-descriptions__content {
    font-size: 12px !important;
    padding: 8px !important;
  }

  .about .el-row {
    margin: 0 !important;
  }

  .about .el-col {
    padding: 0.5rem !important;
  }

  .about .el-statistic__number {
    font-size: 1.25rem !important;
  }

  .about .el-statistic__head {
    font-size: 12px !important;
  }
}
</style>
