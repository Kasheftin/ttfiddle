
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from './vuetify'
import App from './App.vue'
import router from './router'
import './assets/index.css'
import NodeResize from './directives/NodeResize'
import Dragscroll from './directives/Dragscroll/Dragscroll'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.directive('NodeResize', NodeResize)
app.directive('Dragscroll', Dragscroll)

app.mount('#app')
