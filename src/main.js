import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'  //引入App.vue元件,作為入口網站的元件

import router from './router'

// Bootstrap CSS 和 JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'


import './assets/styles/main.css'   // 統一風格樣式的地方

const app = createApp(App)//讓vue3啟動起來,用App.vue當入口元件

app.use(createPinia())//把Pinia插進這個app元件裡

app.use(router)//把router插進這個app元件裡,才能支援多頁切換的功能

app.mount('#app')//把整個Vue App掛到HTML上的#app元素