import { createApp } from 'vue'
import App from './app.vue'
import router from '../html/index.js' // Sesuaikan path jika pakai file router ini

const app = createApp(App)

app.use(router)
app.mount('#app')