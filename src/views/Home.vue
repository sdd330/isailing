<template>
  <div class="home min-h-screen flex items-center justify-center p-3 md:p-4 relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 gradient-bg">
      <div class="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
    </div>

    <!-- 主要内容 -->
    <div class="relative z-10 max-w-md w-full">
      <el-card class="glass-effect card-shadow-lg home-card">
        <div class="text-center">
          <!-- Logo区域 -->
          <div class="relative mb-6">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <el-avatar size="80" class="bg-gradient-to-br from-blue-500 to-cyan-500 relative z-10 mx-auto shadow-2xl">
              <span class="text-white text-3xl font-bold">沪</span>
            </el-avatar>
          </div>

          <!-- 标题区域 -->
          <div class="mb-8">
            <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              iSailing
            </h1>
            <p class="text-gray-800 text-lg font-semibold text-shadow-sm">Web版本 - 经营模拟游戏</p>
            <p class="text-gray-700 text-sm mt-2 font-semibold">iSailing</p>
            <div class="flex justify-center mt-3">
              <el-tag type="primary" size="small" class="mr-2">🎮 模拟经营</el-tag>
              <el-tag type="success" size="small" class="mr-2">💬 对话交互</el-tag>
              <el-tag type="warning" size="small">🎯 策略游戏</el-tag>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="space-y-4 mb-8">
            <router-link to="/game">
            <el-button type="primary" size="large" class="w-full btn-hover shadow-lg" style="height: 50px;">
              🚀 开始游戏
            </el-button>
            </router-link>

            <router-link to="/about">
            <el-button type="default" size="large" plain class="w-full btn-hover" style="height: 50px;">
              📖 关于游戏
            </el-button>
            </router-link>
          </div>

          <el-divider class="my-6" />

          <!-- 特性展示 -->
          <div class="space-y-3 mb-6">
            <div class="flex items-center justify-center text-sm text-gray-800 font-medium">
              <span class="mr-2 text-lg text-green-500">⚡</span>
              <span>现代Web技术构建</span>
            </div>
            <div class="flex items-center justify-center text-sm text-gray-800 font-medium">
              <span class="mr-2 text-lg text-purple-500">🎨</span>
              <span>Element Plus UI组件</span>
            </div>
          </div>

          <!-- 版本信息 -->
          <div class="text-xs text-gray-600 font-medium">
            <p>v1.0.0 - ChatGPT风格对话界面</p>
          </div>
        </div>
      </el-card>

      <!-- 底部装饰 -->
      <div class="text-center mt-8">
          <div class="inline-flex items-center text-gray-700 text-sm font-medium">
            <span class="mr-1">⭐</span>
            <span>iSailing - 体验都市生活</span>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'HomeView' })
// 不使用Element Plus图标，改用emoji
</script>

<style scoped>
.home {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 文字阴影增强可读性 */
.text-shadow-sm {
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8), 0 0 1px rgba(0, 0, 0, 0.1);
}

.home-card :deep(.el-card__body) {
  padding: 2.5rem;
}

@media (max-width: 768px) {
  .home-card :deep(.el-card__body) {
    padding: 1.5rem;
  }

  .home h1 {
    font-size: 2rem !important;
  }

  .home .el-avatar {
    width: 60px !important;
    height: 60px !important;
  }

  .home .el-button {
    height: 44px !important;
    font-size: 14px !important;
  }
}
</style>
