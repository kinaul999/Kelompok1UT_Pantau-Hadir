import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../src/loginwebview.vue'
import RekapitulasiAbsen from '../src/rekapitulasiabsen.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/rekapitulasi',
    name: 'rekapitulasi',
    component: RekapitulasiAbsen
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router