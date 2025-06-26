import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Subscribe from '../views/Subscribe.vue'
import Home from '../views/Home.vue'
import AuthRedirect from '../views/AuthRedirect.vue'

const routes = [
  { path: '/', component: AuthRedirect },
  { path: '/login', component: Login },
  { path: '/subscribe', component: Subscribe },
  { path: '/home', component: Home },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
