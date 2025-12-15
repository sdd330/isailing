<template>
  <div id="app">
    <OfflineIndicator />
    <PWAInstallPrompt />
    <PWAUpdatePrompt />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import PWAInstallPrompt from './components/PWAInstallPrompt.vue'
import PWAUpdatePrompt from './components/PWAUpdatePrompt.vue'
import OfflineIndicator from './components/OfflineIndicator.vue'
</script>

<style>
#app {
  font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
</style>
