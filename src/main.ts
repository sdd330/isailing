import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
// vue-element-plus-x 样式通过组件自动导入，无需手动导入
import 'virtual:uno.css'
import App from './App.vue'
import './style.css'
import './styles/element-plus.css'
import './styles/element-plus-x.css'
import './styles/dialog-compact.css'
import { setupElementPlus } from './plugins/element-plus'
import { setupElementPlusX } from './plugins/element-plus-x'

const app = createApp(App)

app.use(createPinia())
app.use(router)
setupElementPlus(app)
setupElementPlusX(app)

app.mount('#app')
