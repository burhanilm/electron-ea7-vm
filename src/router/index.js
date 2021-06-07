import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Config from '../views/Config.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/cfg',
    name: 'Configuration',
    component: Config
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
